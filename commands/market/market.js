const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
var request = require("request");
var j = request.jar();
var request = request.defaults({ jar : j })
const config = require('../../config.json')
const rates = require('../../Datas/MarketRates').getRates
const countryName = require('../../Datas/GameData').countryName


module.exports = class MarketCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'market',
            group: 'market',
            memberName: 'market',
            description: 'Get cheapest prices of specified product and quality',
            examples: ['market weapon q1'],
            args: [
                {
                    key: 'name',
                    prompt: 'What\'s the item name ?',
                    type: 'string',
                    default: 'null'
                },
                {
                    key: 'quality',
                    prompt: 'What\'s the item quality?',
                    type: 'string',
                    default: 'q5'
                }
            ]
        });
    }

    ///Just to get the url ...
    getMarketUrl(productName, quality, countryId, callback)
    {
        var qualityId = 0;
        switch(quality.toLowerCase()){
            case 'q1': qualityId = 1; break;
            case 'q2': qualityId = 2; break;
            case 'q3': qualityId = 3; break;
            case 'q4': qualityId = 4; break;
            case 'q5': qualityId = 5; break;
            default: qualityId = 5; break;
        }

        var productId = 0;
        var realName = '';
        switch(productName.toLowerCase()){
            case "rawfood": productId = 1; qualityId = 1; realName = 'Raw Food';  break;
            case "rawweapon": productId = 2; qualityId = 1; realName = 'Raw Weapon'; break;
            case "rawhouse": productId = 3; qualityId = 1; realName = 'Raw House'; break;
            case "food": productId = 4; realName = 'Food'; break;
            case "weapon": productId = 5; realName = 'Weapon'; break;
            case "house": productId = 8; realName = 'House'; break;
            case "hospital": productId = 9; realName = 'Hospital'; break;
            case "ds": productId = 10; realName = 'Defense System'; break;
            default: productId = 4; realName = 'Food'; break;
        }

        callback('https://www.erev2.com/en/market/'+countryId+'/'+productId+'/'+qualityId+'/1', realName, qualityId);
    }

    ///Get all prices for each country of specified product and then return it when it's over
    getAllPrices(name, quality, message, callback){
        var that = this;
        var prices = []
        request({
            url:"https://www.erev2.com/en/login",
            method:"POST",
            form:{email: config.email, password: config.password}
        },
        function(error,response,body){
            for(var i = 1; i < countryName().length; i++){

                that.getMarketUrl(name, quality, i, function(url, productName, qualityId){
                    request({
                        url: url,
                        method:"GET",
                    }, function(error, response, body){
                        if(!error)
                        {
                            //Get our ID
                            var path = response.request.uri.pathname
                            var id = path.match('[0-9]{1,}')

                            var regex = '<strong>([0-9 ]{1,})<\/strong><\/td><td class="text-right vs129"><strong>([0-9 ]{1,}\.[0-9]{1,})<\/strong>.*?([A-Z ]{1,})<\/sup>'
                            var result = body.match(regex)
                            
                            if(result !== null){
                                var object = {countryName: countryName()[id], quantity: result[1], price: result[2], 
                                    currency: result[3], priceInGold: result[2] * rates()[id], rates: rates()[id], 
                                    urlMarket: url  }

                                prices.push(object)
                            }
                            else{
                                var object = {countryName: countryName()[id], quantity: -1, price: -1, currency: '', priceInGold: 100000000 }
                                prices.push(object)
                            }
                        }
                        else{
                            var object = {countryName: 'error', quantity: -1, price: -1, currency: '', priceInGold: 100000000 }
                            prices.push(object)
                        }

                        //if over, callback
                        if(prices.length === countryName().length - 1){
                            callback(prices, productName, qualityId);
                        }
                        else{
                            if(prices.length % 16 == 0){
                                message.edit("Getting prices ... " + prices.length + "/" + countryName().length);
                            }
                        }
                        
                    });
                });
            }
        });
    }

    run(msg, { name, quality }) 
    {
        if(name === 'null'){
            const embed = new RichEmbed()
                        .setTitle('Market help')
                        .setColor(0x00AE86)
                        .setTimestamp();
            embed.addField('Product list : ', 'rawfood, rawweapon, food, weapon, house, hospital, ds');
            embed.addField('Quality : ', 'q1, q2, q3, q4, q5');
            embed.addField('Usage: ', 'market {product} {quality}')
            return msg.embed(embed);
        }

        msg.reply('Getting prices ... wait a few seconds').then((message)=>{
            try {
                this.getAllPrices(name, quality, message, function(prices, productName, qualityId) {
                    const embed = new RichEmbed()
                                .setTitle( msg.author.username)
                                .setDescription(productName + '  Q' + qualityId)
                                .setColor(0x00AE86)
                                .setTimestamp();
                    if(prices.length === 0){
                        embed.addField("No product found", "So sell yours", true);
                    }
                    else{
                        prices.sort((a,b) => (a.priceInGold > b.priceInGold) ? 1 : ((b.priceInGold > a.priceInGold) ? -1 : 0)); 
                        for(var i = 0; i < 10; i++){
                            if(prices[i].priceInGold != 100000000)
                            {
                                var embedName = (i+1) +'. ' + prices[i].countryName + ' (qty: ' + prices[i].quantity +')';
                                var embedValue = '['+prices[i].priceInGold.toFixed(4).toString()+' G ' + '(' + prices[i].price + ' ' + prices[i].currency + ' | Rates: ' + prices[i].rates +')](' + prices[i].urlMarket + ')';
                                embed.addField(embedName, embedValue, true); 
                            }
                        }
                    }
                   
                    message.delete()
                    return msg.embed(embed);
                })
            }
            catch(err) {
                return msg.reply("An error occured ...");
            }
            
        })

        
    }
};