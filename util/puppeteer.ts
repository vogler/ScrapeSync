import puppeteer from 'puppeteer';

export const submit = (page: puppeteer.Page) => Promise.all([page.click('[type=submit]'), page.waitForNavigation()]);

declare global {
  interface Window {
    inj: {
      all: (e: Element) => (sel: string) => Element[],
      allT: (e: Element) => (sel: string) => string[],
    }
  }
}
export const inject = (page: puppeteer.Page) => page.evaluate(() => {
  const all = (e: Element) => (sel: string) => Array.from(e.querySelectorAll(sel));
  const allT = (e: Element) => (sel: string) => all(e)(sel).map(e => e.innerHTML.trim());
  window.inj = {all, allT};
});

export const inj_eval_map = async<T> (page: puppeteer.Page, sel: string, f: (e: Element) => T) => {
  await inject(page);
  return await page.$$eval(sel, es => es.map(f));
};
