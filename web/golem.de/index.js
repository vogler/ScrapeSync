const fetch = require('node-fetch');
const cheerio = require('cheerio');

const URL = 'https://golem.de';
const main = async () => {
  const res = await fetch(URL);
  const html = await res.text();
  const $ = cheerio.load(html);
  // $('h2').each((index, element) => {
  //   const text = element.children[0].data.trim();
  //   if (text.length) console.log(text);
  // });
  $('a').each((index, element) => {
    if (element.attribs.href.startsWith('https://www.golem.de/news/')) {
      console.log(index, element.attribs);
    }
  });
};
main();