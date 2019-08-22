import puppeteer from 'puppeteer';

export const submit = (page: puppeteer.Page) => Promise.all([page.click('[type=submit]'), page.waitForNavigation()]);

export const inject = (page: puppeteer.Page) => page.evaluate(() => {
  (<any>window).all = (e: Element) => (sel: string) => Array.from(e.querySelectorAll(sel)).map(e => e.innerHTML.trim());
});

// inject_eval_map?
