import puppeteer from 'puppeteer';
import prompts from 'prompts';

const submit = (page: puppeteer.Page) => Promise.all([page.click('[type=submit]'), page.waitForNavigation()]);

const main = async () => {
  const auth = await prompts([
    { 'name': 'email', 'type': 'text', 'message': 'E-Mail' },
    { 'name': 'password', 'type': 'password', 'message': 'Password' },
    { 'name': 'otp', 'type': 'password', 'message': '2FA/OTP' }]);
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://www.amazon.de/gp/css/order-history');

  // login page
  await page.type('[name=email]', auth.email);
  await page.type('[name=password]', auth.password);
  await page.click('[name=rememberMe]');
  // await page.screenshot({ path: '1.png' });
  await submit(page);

  // 2FA page
  await page.type('[name=otpCode]', auth.otp);
  await page.click('[name=rememberDevice]');
  await submit(page);
  await page.waitFor(5000);

  console.log(await page.cookies());
};
main();