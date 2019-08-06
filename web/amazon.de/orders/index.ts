import assert from 'assert';

import auth from '../../../util/auth'
import puppeteer from 'puppeteer';
import { submit } from '../../../util/puppeteer';

const target = 'https://www.amazon.de/gp/css/order-history';

const main = async () => {
  const browser = await puppeteer.launch({ userDataDir: "./user_data", headless: false, defaultViewport: null });
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
  assert(page.url().startsWith(target));
  await page.waitFor(5000);
  // browser.close();
};
main();