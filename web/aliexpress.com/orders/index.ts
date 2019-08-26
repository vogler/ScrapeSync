import assert from 'assert';

import auth from '../../../util/auth'
import puppeteer from 'puppeteer';
import { inject } from '../../../util/puppeteer';
import { resolve } from 'path';
// import fs from 'fs';

import { createConnection } from 'typeorm';
import { Order } from './entities';

const target = 'https://trade.aliexpress.com/orderList.htm';

const main = async () => {
  const browser = await puppeteer.launch({ userDataDir: resolve('user_data'), headless: true, defaultViewport: null });
  const page = await browser.newPage();
  await page.goto(target);
  // fs.writeFileSync('aliexpress.html', await page.content());

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
  await inject(page);
  const orders = await page.$$eval('tbody', es => es.map(e => {
    const { all, allT, oneT } = window.inj;
    const info = allT(e)('span.info-body');
    const store_url = all(e)('.store-info a', HTMLAnchorElement)[0].href;
    const items = all(e)('tr.order-body').map(e => {
      const a = all(e)('a.baobei-name', HTMLAnchorElement)[0];
      const [price, quantity] = allT(e)('.product-amount span');
      return {
        name: a.innerText,
        variant: oneT(e)('.product-property span.val'),
        price,
        quantity: parseInt(quantity.replace('X', '')),
        status: oneT(e)('.order-status span'),
        url: a.href,
        img: all(e)('img', HTMLImageElement)[0].src,
      }
    });
    return {
      id: info[0],
      order_time: info[1],
      store: {
        id: store_url.split('/').pop(),
        name: info[2],
        url: store_url,
      },
      amount: allT(e)('p.amount-num')[0],
      items,
    }
  }));
  console.dir(orders, { depth: null });

  // sync with database
  const db = await createConnection({
    type: 'sqlite', database: 'aliexpress.sqlite', // required for sqlite
    entities: [Order], synchronize: true, // boilerplate: register entities, synchronize creates tables if not there
    logging: false,
  });
  const dbm = db.manager;
  console.log('Saved orders before: ', await dbm.find(Order));
  await dbm.save(Order, orders);
  console.log('Saved orders after: ', await dbm.find(Order));
  // await page.waitFor(5000);
  browser.close();
};
main();
