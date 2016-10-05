var Xray = require('x-ray');
var xray = Xray();
var table = require('text-table');
var fx = require('money');

var lang = ['de', 'it', 'co.uk']; // domain
var product_url = '/Fujifilm-Systemkamera-Fujinon-Objektiv-Megapixel/dp/B00XW693XE/ref=sr_1_4?ie=UTF8&qid=1475701567&sr=8-4&keywords=fuji+x-t10'

var price_table = [];

lang.forEach(function(language) {
    xray('https://www.amazon.' + language + product_url, '#priceblock_ourprice')(function(err, data) {
        if (err) throw err;
        var price = data;
        price_table.push([language, data, price]);
        console.log(language + ': ' + data + ', ' + price) // Google
    })
})
