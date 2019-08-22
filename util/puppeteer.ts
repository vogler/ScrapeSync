import puppeteer from 'puppeteer';

export const submit = (page: puppeteer.Page) => Promise.all([page.click('[type=submit]'), page.waitForNavigation()]);

export const inject = (page: puppeteer.Page) => page.evaluate(() => {
  const all = (e: Element) => (sel: string) => Array.from(e.querySelectorAll(sel));
  const allT = (e: Element) => (sel: string) => all(e)(sel).map(e => e.innerHTML.trim());
  (<any>window).all = all;
  (<any>window).allT = allT;
});

// inject_eval_map?
