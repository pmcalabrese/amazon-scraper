var Xray = require('x-ray');
var xray = Xray();
var Table = require('cli-table');
var Promise = require('promise');
var request = require('request');

var lang = ['de', 'it', 'co.uk', 'fr']; // domain
var product_url = '/Fujifilm-X-E2S-Appareil-Hybride-Objectif/dp/B01AP7S4PK/ref=sr_1_2?ie=UTF8&qid=1475777231&sr=8-2&keywords=fuji+x-e2s'

const product = {
    url: product_url,
    name: 'Fujifilm XE2s'
}

var price_table = [];
var i = 0;

function exchange_rate(from_currency, to_currency, cb) {
    request('http://api.fixer.io/latest?base='+ from_currency +'&symbols='+ to_currency, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            cb(JSON.parse(body).rates[to_currency])
        }
    })
}

function scrape(language) {
    return new Promise(function (resolve, reject) {
        xray('https://www.amazon.' + language + product.url, '#priceblock_ourprice')(function(err, data) {
            if (err) reject(err);
            var data_to_return = {
                language: language,
                name: product.name,
                price: data
            };
            if (data.indexOf('£') !== -1) {
                exchange_rate('EUR', 'GBP', function(er) {
                    var i = data.indexOf('£');
                    price = parseFloat(data.substring(i+1)) / parseFloat(er);
                    data_to_return.price_eur = price
                    resolve(data_to_return);
                })
            } else {
                data_to_return.price_eur = data;
                resolve(data_to_return);
            }
        })
    })
}


// Build promises array
var scrape_arr = []
lang.forEach(function(language) {
    scrape_arr.push(scrape(language))
})

// When all request are done
Promise.all(scrape_arr).then(function(data) {
    var table = new Table({
        head: ['Site', 'name', 'original price', 'price (EUR)'],
        colWidths: [10, 20, 20 ,20]
    });
    data.forEach(function(product) {
        var arr = [];
        for (value in product) {
            console.log(value);            
            arr.push(product[value]);
        }
        table.push(arr);
    })
    console.log(table.toString())
})
