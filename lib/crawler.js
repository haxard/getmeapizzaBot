var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

exports.crawl = function (url, restaurant_name, container_identifier, name_identifier, price_identifier) {
    //check if the requested menu card has already been downloadeda and check lastModified
    var lastModified;
    var options = {
        uri: url,
        headers: []
    };

    fs.exists('./lib/out/' + restaurant_name + '.json', function (exists) {
        if (exists) {
            var file = JSON.parse(fs.readFileSync('./lib/out/' + restaurant_name + '.json', 'utf8'));
            options.headers.push({
                'If-Modified-Since': file.lastModified
            });
        }
    });

    var decodeHtmlInput = function (value) {
        return value.replace(/&#(\d+);/g, function (match, dec) {
            return String.fromCharCode(dec);
        });
    };


    //replace known Unicode characters
    var replaceUnicode = function (value) {
        var regex = /&#(x.*\w)+;/       //matches all unicode characters in hex format &#x...; and groups the code starting with x
        return (regex.test(value) ? value.replace(regex, String.fromCharCode('0' + regex.exec(value)[1])) : value);
    }

    request(options, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);

            var name, price;
            json = {
                lastModified: '',
                meals: []
            };
            json.lastModified = new Date().toUTCString();

            $(container_identifier).each(function (index, elem) {
                var obj = { name: "", price: "" };
                var $this = $(this);

                name = $this.find(name_identifier).html();
                price = $this.find(price_identifier).html();
                // TODO: reshape this to be more general

                obj.name = name;
                obj.price = price;

                json.meals.push(obj);
            });

            var result = JSON.stringify(json, function (key, value) {
                return replaceUnicode(decodeHtmlInput(value));
            }, 4);

            fs.writeFile('./lib/out/' + restaurant_name + '.json', result, function (err) {
                console.log('File successfully written! Not modified or not Last-Modified Header');
            });

        } else if (response.statusCode == 304) {
            console.log("The document hasn't been modified.\nDidn't update the file.")
        };
    });
}

