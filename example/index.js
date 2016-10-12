var AmazonScraper = require('amazon-scraper')

var amazon_scraper = AmazonScraper('./config.json');

amazon_scraper.scraper.then(function(data) {
    amazon_scraper.printTable(data)
});