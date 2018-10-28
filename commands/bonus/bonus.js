const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const countryName = require('../../Datas/GameData').countryName
var request = require("request");

module.exports = class CitizenCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'bonus',
            group: 'country',
            memberName: 'bonus',
            description: 'Get informations about bonus',
            examples: ['bonus portugal', 'bonus'],
            args: [
                {
                    key: 'name',
                    prompt: 'For what country ?',
                    type: 'string',
                    default: 'all'
                }
            ]
        });
    }

    run(msg, { name }) {
        var countryBonus = []
        for(var i = 1; i < countryName().length + 1; i++){
            countryBonus[i] = {
                name: countryName()[i],
                grain: false, deer: false, fish: false, cattle: false, fruits: false,
                iron: false, aluminum: false, saltpeter: false, oil: false, rubber: false,
                sand: false, clay: false, wood: false, limestone: false, granite: false,
                foodBonus: 0, weaponBonus: 0, houseBonus: 0, averageBonus: 0
            }
        }
        request({
            url: 'https://www.erev2.com/en/api/map/1',
            json: true
        }, 
        function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var map = body
                var mapSize = Object.keys(map).length

                //Gathering map data
                for(var i = 1; i <= mapSize; i++){
                    var countryId = map[i].owner_current_id
                    var resourceName = map[i].resource.toLowerCase()
                    countryBonus[countryId][resourceName] = true
                }

                //Setting the bonuses
                for(i = 1; i < countryBonus.length; i++){
                    
                    countryBonus[i].foodBonus = [countryBonus[i].grain, countryBonus[i].deer, 
                                                countryBonus[i].fish, countryBonus[i].cattle, 
                                                countryBonus[i].fruits]
                                                .filter(Boolean).length * 20
                    
                    countryBonus[i].weaponBonus = [countryBonus[i].iron, countryBonus[i].aluminum, 
                                                countryBonus[i].saltpeter, countryBonus[i].oil, 
                                                countryBonus[i].rubber]
                                                .filter(Boolean).length * 20

                    countryBonus[i].houseBonus = [countryBonus[i].sand, countryBonus[i].clay, 
                                                countryBonus[i].wood, countryBonus[i].limestone, 
                                                countryBonus[i].granite]
                                                .filter(Boolean).length * 20
                                                
                    countryBonus[i].averageBonus = (countryBonus[i].foodBonus + countryBonus[i].weaponBonus + countryBonus[i].houseBonus)/3
                }

                const embed = new RichEmbed()
                                .setTitle( msg.author.username)
                                .setColor(0x00AE86)
                                .setTimestamp();


                //if all, then show top 10
                if(name === 'all'){
                    countryBonus.sort((a,b) => (a.averageBonus > b.averageBonus) ? -1 : ((b.averageBonus > a.averageBonus) ? 1 : 0));
                    embed .setDescription("Top 10 country for bonuses")
                    for(i = 1; i < 11; i++){
                        var fieldName = i +". " + countryBonus[i].name
                        var fieldValue = "Food : " + countryBonus[i].foodBonus+" % | " +
                                        "Weapon : " + countryBonus[i].weaponBonus+" % | " +
                                        "House : " + countryBonus[i].houseBonus+" %"
                        embed.addField(fieldName, fieldValue, false);
                    }
                    return msg.embed(embed);
                }

                //If weapon bonuses
                else if(name === 'weapon'){
                    countryBonus.sort((a,b) => (a.weaponBonus > b.weaponBonus) ? -1 : ((b.weaponBonus > a.weaponBonus) ? 1 : 0));
                    embed .setDescription("Top 10 country for weapon bonuses")
                    for(i = 1; i < 11; i++){
                        var fieldName = i +". " + countryBonus[i].name
                        var fieldValue = "Weapon bonus : " + countryBonus[i].weaponBonus+" %"
                        embed.addField(fieldName, fieldValue, false);
                    }
                    return msg.embed(embed);
                }

                //If food bonuses
                else if(name === 'food'){
                    countryBonus.sort((a,b) => (a.foodBonus > b.foodBonus) ? -1 : ((b.foodBonus > a.foodBonus) ? 1 : 0));
                    embed .setDescription("Top 10 country for food bonuses")
                    for(i = 1; i < 11; i++){
                        var fieldName = i +". " + countryBonus[i].name
                        var fieldValue = "Food bonus : " + countryBonus[i].foodBonus+" %"
                        embed.addField(fieldName, fieldValue, false);
                    }
                    return msg.embed(embed);
                }

                //if house bonuses
                else if(name === 'house'){
                    countryBonus.sort((a,b) => (a.houseBonus > b.houseBonus) ? -1 : ((b.houseBonus > a.houseBonus) ? 1 : 0));
                    embed .setDescription("Top 10 country for house bonuses")
                    for(i = 1; i < 11; i++){
                        var fieldName = i +". " + countryBonus[i].name
                        var fieldValue = "House bonus : " + countryBonus[i].houseBonus+" %"
                        embed.addField(fieldName, fieldValue, false);
                    }
                    return msg.embed(embed);
                }

                //Else it's for one specific country
                else{

                    //Look bad but does the job ¯\_(ツ)_/¯
                    if(name.includes("bosnia")) name = 'BiH'
                    else if(name.includes("macedonia")) name = 'FYROM'
                    else if(name.includes("america")) name = 'USA'
                    else if(name.includes("emirate")) name = 'UAE'

                    //first letter to uppercase
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                    var countryId = countryName().indexOf(name)

                    if(countryId > 0){
                        embed .setDescription("Bonuses for " + countryName()[countryId])
                        embed.addField("Food", countryBonus[countryId].foodBonus + "%", false);
                        embed.addField("Weapon", countryBonus[countryId].weaponBonus + "%", false);
                        embed.addField("House", countryBonus[countryId].houseBonus + "%", false);
                        return msg.embed(embed);
                    }

                    return msg.reply("Country not found");
                }
            }
            else{
                return msg.say('An error occured ...');
            }
        });
    }
};