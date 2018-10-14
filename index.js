const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const path = require('path');
const config = require("./config.json");
const updateRates = require("./Datas/MarketRates").updateRates

const client = new Commando.Client({
    commandPrefix: config.prefix,
    owner: '202303964211838986'
});



client.registry
    // Registers all built-in groups, commands, and argument types
    .registerDefaults()
    .registerGroups([
        ['citizen', 'Citizen related commands'],
        ['market', 'Market related commands']
    ])
    // Registers all of your commands in the ./commands/ directory
    .registerCommandsIn(path.join(__dirname, 'commands'));

    

client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);

client.login(config.token);

//Get monetary rates and then update every hour
updateRates();
setInterval(updateRates, 3600000);