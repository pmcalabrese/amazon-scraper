const Xray = require('x-ray');
const xray = Xray();
const Table = require('cli-table');
const Promise = require('promise');
const request = require('request');
const numeral = require('numeral');

function exchange_rate(from_currency, to_currency, cb) {
    request('http://api.fixer.io/latest?base='+ from_currency +'&symbols='+ to_currency, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(JSON.parse(body).rates[to_currency])
        }
    })
}

function euroUnformatter(text) {
    var new_text = text.replace('.','').replace(' ','').replace(',','.')
    return numeral().unformat(new_text)
}

function scrape(language, product_url) {
    return new Promise(function (resolve, reject) {
        xray('https://www.amazon.' + language + product_url, {
            price: '#priceblock_ourprice',
            product_name: '#productTitle'
        })(function(err, data) {
            if (err) reject(err);
            var data_to_return = {
                datetime: new Date().toLocaleDateString('da'),
                language: language,
                name: data.product_name.replace('\n', ' ').trim(),
                price: data.price
            };
            if (data.price.indexOf('£') !== -1) {
                exchange_rate('EUR', 'GBP', function(er) {
                    var i = data.price.indexOf('£');
                    price = parseFloat(data.price.substring(i+1)) / parseFloat(er);
                    data_to_return.price_eur = price
                    resolve(data_to_return);
                })
            } else {
                data_to_return.price_eur = euroUnformatter(data.price);
                resolve(data_to_return);
            }
        })
    })
}

function sortByPrice(a, b) {
  if (a.price_eur < b.price_eur) return -1;
  if (a.price_eur > b.price_eur) return 1;
  return 0;
}

function printTable(data) {
    data.sort(sortByPrice);
    var table = new Table({
        head: ['Date', 'Site', 'Product name', 'Original price', 'Price (EUR)'],
        colWidths: [20, 10, 20, 20 ,20]
    });
    data.forEach(function(product) {
        var arr = [];
        for (value in product) {
            arr.push(product[value]);
        }
        table.push(arr);
    })
    console.log(table.toString())
}

module.exports = function(config) {
    // Build promises array
    var scrape_arr = []
    config.lang.forEach(function(language) {
        scrape_arr.push(scrape(language, config.product_url))
    })

    return {
        printTable: printTable,
        scraper: Promise.all(scrape_arr)
    }
};