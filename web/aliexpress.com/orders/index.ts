import assert from 'assert';

import auth from '../../../util/auth'
import puppeteer from 'puppeteer';
import { inject } from '../../../util/puppeteer';
import { resolve, relative } from 'path';
import fs from 'fs';

import { createConnection } from 'typeorm';
import { Order, Store, Item } from './entities';
import { Money } from '../../../util/db';

const name = relative(resolve('web'), __dirname).replace('/', '-');
var target = 'https://trade.aliexpress.com/orderList.htm';

const main = async () => {
  const browser = await puppeteer.launch({ userDataDir: resolve('data/browser'), headless: true, defaultViewport: null });
  const page = await browser.newPage();
  const offline = process.argv.length >= 3 && process.argv[2] == 'offline';
  const offline_file = resolve('data/', name + '.html');
  console.log(__dirname, offline_file);
  if (offline && fs.existsSync(offline_file)) {
    target = 'file://' + offline_file; // page.goto works, with page.setContent(fs.readFileSync(offline_file).toString()) all href were empty
    console.log('offline: load page content from', offline_file);
  }
  await page.goto(target);

  // login page
  if (page.url().startsWith('https://login.aliexpress.com')) {
    const cred = await auth(target);
    // const frame = (await (await page.$('iframe'))!.contentFrame())!;
    const frame = page.frames()[2];
    await frame.$eval('#fm-login-id', (e, a) => (<HTMLInputElement>e).value = a, cred.account);
    await frame.type('#fm-login-password', cred.password);
    await Promise.all([frame.click('[type=submit]'), page.waitForNavigation()]);
    if (page.url().startsWith('https://login.aliexpress.com')) {
      console.error('Login failed. Wrong credentials?');
      if (await cred.delete()) console.log('Deleted saved credentials.');
      process.exit(1);
    }
    await cred.save();
  }
  if (!page.url().startsWith(target)) {
    console.warn(`URL is ${page.url()} instead of ${target}! Redirecting...`);
    await page.goto(target);
  }
  assert(page.url().startsWith(target));
  if (offline && !fs.existsSync(offline_file)) {
    fs.writeFileSync(offline_file, await page.content());
    console.log('offline: wrote page content to', offline_file);
  }
  await inject(page); // utility functions in window.inj
  // 1. extract
  const orders_web = await page.$$eval('tbody', es => es.map(e => {
    const { all, allT, oneT } = window.inj;
    const info = allT(e)('span.info-body');
    const store_url = all(e)('.store-info a', HTMLAnchorElement)[0].href;
    const items = all(e)('tr.order-body').map(e => {
      const a = all(e)('a.baobei-name', HTMLAnchorElement)[0];
      const [price, quantity] = allT(e)('.product-amount span');
      return {
        productId: a.href.match(/\/(\d+)\.html.*$/)![1],
        name: a.innerText,
        variant: oneT(e)('.product-property span.val'),
        price,
        quantity: parseInt(quantity.replace('X', '')),
        status: oneT(e)('.order-status span'),
        url: a.href.replace('file://', 'https://'),
        img_url: all(e)('img', HTMLImageElement)[0].src,
      }
    });
    return {
      id: info[0],
      order_date: info[1] + ' UTC-7', // Somehow PDT fit to time from 'order has been paid' mails. Why do they use this fixed local time? Can't set timezone on website, same when switching to german. Date is saved as UTC+0 in DB. Need to convert to local time on client.
      store: {
        id: store_url.split('/').pop(),
        name: info[2],
      },
      amount: allT(e)('p.amount-num')[0],
      items,
    }
  }));
  // console.dir(orders_web, { depth: null });
  // 2. transform
  // parse some strings (doing this above in eval would require injecting used functions) and normalize to common model
  const orders = orders_web.map(order => {
    const items = order.items.map(item => {
      return {
        ...item,
        price: new Money(item.price),
      };
    });
    return {
      ...order,
      items,
      price: new Money(order.amount),
    };
  });
  console.dir(orders, { depth: null });
  // 3. sync with database
  const entities = [Order, Store, Item];
  const db = await createConnection({
    type: 'sqlite', database: `data/${name}.sqlite`, // required for sqlite
    entities, synchronize: true, // boilerplate: register entities, synchronize creates tables if not there
    logging: false,
  });
  const dbm = db.manager;
  const count = () => Promise.all(entities.map(entity => dbm.count(entity)));
  const counts = await count();
  // console.log('Saved orders before:', await dbm.find(Order));
  await dbm.save(Order, orders);
  console.dir(await dbm.find(Order), { depth: null });
  console.log('New entities:', (await count()).map((c, i) => [entities[i].name, c - counts[i]]));
  // done
  browser.close();
};
main();
