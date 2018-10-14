const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const militaryRank = require('../../Datas/GameData').militaryRank;
var request = require("request");

module.exports = class CitizenCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'citizen',
            group: 'citizen',
            memberName: 'citizen',
            description: 'Get information about a citizen',
            examples: ['citizen Tada'],
            args: [
                {
                    key: 'name',
                    prompt: 'What\'s the user name or ID ?',
                    type: 'string'
                }
            ]
        });
    }

    //////
    // If name is not an ID, then get and return ID
    //////
    getId(name, callback) {
        if(isNaN(name)){
            request({
                url: 'https://www.erev2.com/en/search',
                method: 'POST',
                formData: {
                  'searchword': name
                }
            }, function(error, response, body){
                var regex = 'profile\/([0-9]{1,})'
                var result = body.match(regex);
                callback(result[1]);
            });
        }
        else{
            callback(name);
        }
    }

    run(msg, { name }) {

        //Name is not the ID then let's get the ID 
        this.getId(name, function(id){
            var url = "https://www.erev2.com/en/api/citizen/" + id;

            request({
                url: url,
                json: true
            }, 
            function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var citizen = body[0]
                    const embed = new RichEmbed()
                        .setTitle(citizen.Name + '(' + citizen.ID +')')
                        .setDescription(citizen.CS)
                        .setColor(0x00AE86)
                        .setURL('https://www.erev2.com/en/profile/' + id)
                        .setThumbnail('https://www.erev2.com/public/upload/citizen/'+id+'.jpg?' + Math.random() * 999999)
                        .setTimestamp();
                    embed.addField('Level', citizen.Level, true);    
                    embed.addField('Last seen', citizen.LastSeen, true);   
                    embed.addField('Strength', citizen.Strength, true);   
                    embed.addField('Military rank', militaryRank()[citizen.MilitaryRank-1], true);   
                    embed.addField('Damage per hit', citizen.DMG1HIT, true);
                    embed.addField('Total damage', citizen.TotalDMG, true);  
                    return msg.embed(embed);
                }
                else{
                    return msg.say('Sorry dude, I don`t know this guy');
                }
            });
        });
    }
};