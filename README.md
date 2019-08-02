A lot of our data is spread around the web, without a generic way to access it.
Better to extract relevant structured data and gather it locally.

## Why?

- **Backup** "Everything not saved will be lost"
  Many services just shut down. Last instance: "Save your Google+ content before March 31, 2019". More: https://killedbygoogle.com/
  Don't want to worry about getting all data out before some strange deadline.
  Limited storage: eBay only keeps data for the last 90 days? How often do you need to check Facebook to not miss posts?
  Content might be changed or deleted (e.g. URL now shows a different article, comment might be deleted).
- **Access** zoo of clunky/slow/lacking UIs
  Data is siloed, there's no way to list all data from all websites.
  Sometimes have to login and click through a couple of pages to get to the actual data.
  Sometimes the data is spread across several pages, but I want to see it all together.
  Some data might not be visible in the UI, but only via API or data export (which might take days and be several GBs).
  Unreliable search: can't find some ordered items on AliExpress, despite them being in the list.
- **Consolidation/analysis**
  Same class of data should be stored using the same schema. E.g. orders from different websites.
  Enables analysis and statistics like how much you ordered, commented etc.
- **Automation/notifications**
  Don't want to check websites manually for change. Enables automation.
- **Extend/link/track**
  What if I want to save some note for an order? Could save the note somewhere and link to the order. Better to have it together.
  Some data is not linkable, or the link is not specific enough.
  Enables meta data, like when and how often data has been seen.
  Different types of data might belong to the same group/project and should be tagged as such.

With some UI on top this could also be used as a feed reader.

## How?

- **API** easiest and most reliable way to get structured data.
- **Web scraping** Might require adjustments whenever the structure of the web site changes.
- **File system** Some data might already be stored locally and just needs to be imported.

Browser extensions (via [ScrapeMe](https://github.com/devrazdev/ScrapeMe#yet-another-tool): [Web Scraper](https://github.com/martinsbalodis/web-scraper-chrome-extension/), [Scraper](https://github.com/mnmldave/scraper), [Helena](https://github.com/schasins/helena)) allow for easy web scraping but can't be automated to run and merge the result into a local database. Seems better to have it run 24/7 on a RPi than running it in Chrome and slowing it down or spinning my MBP fan up.
Cloud-based data mining/web scraping services are not free and I don't want them to have the data.

How to detect change?
- For file system sources we can use [fswatch](https://github.com/emcrisostomo/fswatch).
- For web:
  - Some web sites might offer URL hooks that are called on change. For these some public URL for the trigger is needed.
  - Most web sites we will have to query periodically. What's a good delay? How to schedule? Limit traffic? Spread out to avoid congestion?
    - APIs might have a limit on the number of requests.
    - Web sites might block us if we request a page too often?

### Scrape

Seems to make sense to stick to node/javascript.

- [cheerio](https://github.com/cheeriojs/cheerio): jQuery for node
  Fast but only works if data is included in the initial server response. Login might be hard.
- [Puppeteer](https://github.com/GoogleChrome/puppeteer): Headless Chrome Node API
  - [Nightmare](https://github.com/segmentio/nightmare): same but using Electron?
  - [Daydream](https://github.com/segmentio/daydream): chrome extension to record your actions into a nightmare or puppeteer script
- ruled out: [PhantomJS](https://github.com/ariya/phantomjs) (archived), [jsdom](https://github.com/jsdom/jsdom) (limitations)

### Sync

If we don't want to download all data every time, the data needs to be sorted/append-only. We can then stop requests once we see records we already have locally (need for threshold in case of insertions?).
In case of mutable state (e.g. order status is just one field instead of history), match record via some ID, update state and save transition.
Save it into some document store like MongoDB.

### Structure

Use a directory in `web/` for each website.  It should have a

- `README.md` with
  - screenshots that highlight the exported data,
  - an example of the exported data,
  - possibly a description of the shortcomings of the interface.
- `index.js` which has
  - the `schema` of the extracted data
  - a function `get`
  - a function `save`

## Usage

After `yarn install` do
- `yarn sync <website1> <website2> <...>` to get data continuously and store it
- `yarn scrape <website>` to get data once without storing it (for debugging)
