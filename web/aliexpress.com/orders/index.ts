import assert from 'assert';

// import auth from '../../../util/auth'
import puppeteer from 'puppeteer';
import { submit } from '../../../util/puppeteer';
import { resolve } from 'path';

const target = 'https://trade.aliexpress.com/orderList.htm';

const main = async () => {
  const browser = await puppeteer.launch({ userDataDir: resolve('user_data'), headless: true, defaultViewport: null });
  const page = await browser.newPage();
  await page.goto(target);

  // login page
  if (page.url().startsWith('https://login.aliexpress.com')) {
    const cred = {account: 'foo', password: 'bar'};
    // const cred = await auth(target);
    await page.waitFor(5000);
    console.log(await page.content());
    console.log(await page.$$eval('.fm-text', es => es)); // values get serialized by jQuery
    await page.type('#fm-login-id', cred.account);
    await page.type('#fm-login-password', cred.password);
    await submit(page);
    if (page.url().startsWith('https://login.aliexpress.com')) {
      console.error('Login failed. Wrong credentials?');
      // if (await cred.delete()) console.log('Deleted saved credentials.');
      process.exit(1);
    }
    // await cred.save();
  }
  if (page.url() != target) {
    console.warn(`URL is ${page.url()} instead of ${target}`);
    page.goto(target);
  }
  assert(page.url().startsWith(target));
  // const val = (e: Element | null) => e && e.innerHTML.trim() || ''; // can't pass functions into eval?
  // const orders = await Promise.all((await page.$$('div.order')).map(async div => {
  //   const info = await div.$$eval('span.value', es => es.map(e => e.innerHTML.trim()));
  //   const shipments = await div.$$eval('div.shipment', es => es.map(e => ({
  //     status: (e => e && e.innerText.trim())(e.querySelector('span')),
  //     items: Array.from(e.querySelectorAll('div.a-fixed-left-grid-inner')).map(e => {
  //       const a = Array.from(e.querySelectorAll('a'));
  //       return {
  //         name: a[1].innerText,
  //         url: a[1].href,
  //         img: e.querySelector('img')!.getAttribute('data-a-hires'),
  //         price: e.querySelector('nobr') && e.querySelector('nobr')!.innerHTML || e.querySelector('span.a-color-price')!.innerHTML.trim(),
  //       };
  //     })
  //   })));
  //   return {
  //     order_date: info[0],
  //     sum: info[1],
  //     nr: info[2],
  //     shipments,
  //   };

  // }));
  // console.dir(orders, { depth: null });
  // await page.waitFor(5000);
  browser.close();
};
main();