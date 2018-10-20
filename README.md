# PuppetMaster

### How to run it
1. First you must create and fill the config file (config.json) -> look at the example
2. Install Nodejs and use 'npm start' in your terminal to start the bot

For Debian & Ubuntu user : https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

Also in case of problem with sqlite, comment these lines in index.js
```
const sqlite = require('sqlite');
``` and ```
client.setProvider(
    sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);
```

config.json example
```
{ 
  "token"  : "YOUR TOKEN",
  "prefix" : "/",
  "email" : "EMAIL OF YOUR ACCOUNT (use a fake ...)",
  "password" : "YOUR PASSWORD"
}
```
