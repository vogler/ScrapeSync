import assert from 'assert';

import auth from '../../../util/auth'
import puppeteer from 'puppeteer';
import { inject } from '../../../util/puppeteer';
import { resolve } from 'path';
// import fs from 'fs';

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
    await frame.$eval('#fm-login-id', (e, a) => (<HTMLInputElement> e).value = a, cred.account);
    await frame.type('#fm-login-password', cred.password);
    await Promise.all([frame.click('[type=submit]'), page.waitForNavigation()]);
    if (page.url().startsWith('https://login.aliexpress.com')) {
      console.error('Login failed. Wrong credentials?');
      if (await cred.delete()) console.log('Deleted saved credentials.');
      process.exit(1);
    }
    await cred.save();
  }
  if (page.url() != target) {
    console.warn(`URL is ${page.url()} instead of ${target}! Redirecting...`);
    await page.goto(target);
  }
  assert(page.url().startsWith(target));
  await inject(page);
  const orders = await page.$$eval('tbody', es => es.map(e => {
    const all = (<any>window).all(e);
    const info = all('span.info-body');
    return {
      id: info[0],
      order_time: info[1],
      store_name: info[2],
      amount: all('p.amount-num')[0],
    }
  }));
  console.dir(orders, { depth: null });
  // await page.waitFor(5000);
  browser.close();
};
main();
