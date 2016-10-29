var TelegramBot = require('node-telegram-bot-api');
var dotenv = require('dotenv');

dotenv.load();

/**
* /add - adds a pizza
* /getMeThePizza - prints a list of pizzas
* /end - deletes the old list
*/

var token = process.env.TELEGRAM_TOKEN;

var bot = new TelegramBot(token, {polling: true});

pizzaArray = [];

// Matches /start
bot.onText(/\/add (.+)/, function (msg, match) {
	var user = msg.from.id;
 	var resp = match[1];
	pizzaArray.push(
		{
			id : msg.from.id,
			first_name: msg.from.first_name,
			last_name: msg.from.last_name,
			username: msg.from.username,
			pizza: resp
		}
	);
	console.log(pizzaArray);
});

bot.onText(/\/getMeThePizza/, function(msg, match) {
	var chat = msg.chat.id;
	var result = "";
	if(typeof pizzaArray !== 'undefined' && pizzaArray.length > 0) {
		for(var i=0;i<pizzaArray.length;i++) {
			if((pizzaArray[i].first_name != undefined) && (pizzaArray[i].last_name != undefined)) {
				result += pizzaArray[i].first_name + " " + pizzaArray[i].last_name + ": ";
				result += pizzaArray[i].pizza + "\n";
			} else {
				result += pizzaArray[i].username + ": ";
				result += pizzaArray[i].pizza + "\n";
			}
		}
	} else {
		result = "Es wurde noch keine Pizza bestellt ... :D";
	}
	bot.sendMessage(chat, result);
});

bot.onText(/\/del (.+)/, function(msg, match) {
	var chat = msg.chat.id;
	var username = match[1];

	var index = pizzaArray.findIndex(function(obj) {
		return obj.username == username;
	});

	if (index > -1) {
    if(pizzaArray.splice(index, 1)) {
			var result = "Die Pizza von " + username + " hab ich gelöscht"
		};
	};

	bot.sendMessage(chat, result);
});
