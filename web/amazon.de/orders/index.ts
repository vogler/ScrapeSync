import assert from 'assert';

import auth from '../../../util/auth'
import puppeteer from 'puppeteer';
import { submit } from '../../../util/puppeteer';

const target = 'https://www.amazon.de/gp/css/order-history';

const main = async () => {
  const cred = await auth(target);
  console.log(cred);
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(target);

  // login page
  if (page.url().startsWith('https://www.amazon.de/ap/signin')) {
    await page.type('[name=email]', cred.account);
    await page.type('[name=password]', cred.password);
    await page.click('[name=rememberMe]');
    await submit(page);

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
  }
  console.log(page.url());
  assert(page.url().startsWith(target));
  await cred.save();
  await page.waitFor(5000);
  // console.log(await page.cookies());
  // browser.close();
};
main();