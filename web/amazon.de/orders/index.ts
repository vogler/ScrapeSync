import puppeteer from 'puppeteer';
import { submit } from '../../../util/puppeteer';
import prompts from 'prompts';
import validator from 'validator';
import assert from 'assert';

const target = 'https://www.amazon.de/gp/css/order-history';

const main = async () => {
  const auth = await prompts([
    { 'name': 'email', 'type': 'text', 'message': 'E-Mail', validate: x => validator.isEmail(x) || 'invalid address' },
    { 'name': 'password', 'type': 'password', 'message': 'Password' },
    { 'name': 'otp', 'type': 'password', 'message': '2FA/OTP (enter if not needed)' }]);
  if (!auth.email || !auth.password) return;
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(target);

  if (page.url().startsWith('https://www.amazon.de/ap/signin')) {
    // login page
    await page.type('[name=email]', auth.email);
    await page.type('[name=password]', auth.password);
    await page.click('[name=rememberMe]');
    // await page.screenshot({ path: '1.png' });
    await submit(page);
    
    // 2FA page
    if (page.url().startsWith('https://www.amazon.de/ap/mfa')) {
      if (!auth.otp.length) {
        console.error('Got redirected to 2FA page, but you did not enter a code.');
        return;
      }
      await page.type('[name=otpCode]', auth.otp);
      await page.click('[name=rememberDevice]');
      await submit(page);
    }
  }
  console.log(page.url());
  assert(page.url().startsWith(target));
  await page.waitFor(5000);
  // console.log(await page.cookies());
  // browser.close();
};
main();