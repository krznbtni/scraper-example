const express = require('express'),
      scraperjs = require('scraperjs'),
      app = express();

// convert scraping into an array
let newsFromAB = [];
let newsFromDN = [];

async function scrapeAftonbladet() {
  let ab = scraperjs.StaticScraper.create('https://aftonbladet.se');

  let news = await ab.scrape(($) => {
    return $('a[href*="/nyheter"] h3').map(function () {
      return {
        text: $(this).text(),
        url: 'https://aftonbladet.se' + $(this).closest('a').attr('href')
      }
    }).get();
  });

  newsFromAB = news;
}

async function scrapeDN() {
  let dn = scraperjs.StaticScraper.create('https://aftonbladet.se');

  let news = await dn.scrape(($) => {
    return $('a[href*="/nyheter"] h2, a[href*="/nyheter"] h3').map(function () {
      return {
        text: $(this).text(),
        url: 'https://dn.se' + $(this).closest('a').attr('href')
      }
    }).get();
  });

  newsFromDN = news;
}

// Scrape once every minute
scrapeAftonbladet();
setInterval(scrapeAftonbladet, 60 * 1000);

scrapeDN();
setInterval(scrapeDN, 60 * 1000);

// ROUTES FOR JSON
app.get('/ab-news', (req, res) => {
  res.json(newsFromAB);
});

app.get('/dn-news', (req, res) => {
  res.json(newsFromDN);
});

app.get('/all-news', (req, res) => {
  res.json(
    newsFromAB.concat(newsFromDN)
      .sort((a,b) => a.text > b.text ? 1 : -1)
  );
});

app.listen(4999, () => console.log('UP AND RUNNING ON PORT 4999'));
