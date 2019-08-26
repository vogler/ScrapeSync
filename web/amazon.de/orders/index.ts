import assert from 'assert';

import auth from '../../../util/auth'
import puppeteer from 'puppeteer';
import { submit, inject } from '../../../util/puppeteer';
import { resolve } from 'path';

const target = 'https://www.amazon.de/gp/your-account/order-history?orderFilter=year-2019';

const main = async () => {
  const browser = await puppeteer.launch({ userDataDir: resolve('user_data'), headless: true, defaultViewport: null });
  const page = await browser.newPage();
  await page.goto(target);

  // login page
  if (page.url().startsWith('https://www.amazon.de/ap/signin')) {
    const cred = await auth(target);
    await page.type('[name=email]', cred.account);
    await page.type('[name=password]', cred.password);
    await page.click('[name=rememberMe]');
    await submit(page);
    if (page.url().startsWith('https://www.amazon.de/ap/signin')) {
      console.error('Login failed. Wrong credentials?');
      if (await cred.delete()) console.log('Deleted saved credentials.');
      process.exit(1);
    }

    // 2FA page
    while (page.url().startsWith('https://www.amazon.de/ap/mfa')) {
      await page.click('[name=rememberDevice]');
      if (!cred.otp) {
        console.error('Got redirected to 2FA page, but you did not enter a code (or it is wrong). Please enter manually and submit.');
        await page.waitForNavigation({ timeout: 0 });
      } else {
        await page.type('[name=otpCode]', cred.otp);
        delete cred.otp; // switch to manual if invalid
        await submit(page);
      }
    }
    await cred.save();
  }
  if (page.url() != target) {
    console.warn(`URL is ${page.url()} instead of ${target}! Redirecting...`);
    await page.goto(target);
  }
  assert(page.url().startsWith(target));
  await inject(page);
  const orders = await page.$$eval('div.order', es => es.map(e => {
    const { all, allT, oneT } = window.inj;
    const info = allT(e)('span.value');
    const shipments = all(e)('div.shipment').map(e => ({
      status: oneT(e)('span'),
      items: all(e)('div.a-fixed-left-grid-inner').map(e => {
        const a = all(e)('a', HTMLAnchorElement);
        return {
          name: a[1].innerText,
          url: a[1].href,
          img: e.querySelector('img')!.getAttribute('data-a-hires'),
          price: oneT(e)('nobr, span.a-color-price'),
        };
      })
    }));
    return {
      order_date: info[0],
      sum: info[1],
      nr: info[2],
      shipments,
    };

  }));
  console.dir(orders, { depth: null });
  // await page.waitFor(5000);
  browser.close();
};
main();
