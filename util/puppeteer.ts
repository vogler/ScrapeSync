import puppeteer from 'puppeteer';

export const submit = (page: puppeteer.Page) => Promise.all([page.click('[type=submit]'), page.waitForNavigation()]);