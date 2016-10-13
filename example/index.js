const AmazonScraper = require('amazon-scraper')
const config = require('./config.json')

const amazon_scraper = AmazonScraper(config);

amazon_scraper.scraper.then(function(data) {
    amazon_scraper.printTable(data)
});