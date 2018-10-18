const countryName = require('../Datas/GameData').countryName
const config = require('../config')
var request = require("request");
var j = request.jar();
var request = request.defaults({ jar : j })

var rates = [];


function getRates(){
    return rates;
}

function updateRates(){
    request({
        url:"https://www.erev2.com/en/login",
        method:"POST",
        form:{email: config.email, password: config.password}
    },
    function(error,response,body){
        var localRates = []
        for(var i = 1; i < countryName().length; i++){
            request({
                url: "https://www.erev2.com/en/monetary-market/"+i+"/1/1",
                method:"GET",
            }, function(error, response, body){
                if(!error)
                {
                    var regex = 'class="text-right vs129"><strong>([0-9 ]{1,}\.[0-9]{1,}).*?<strong>([0-9 ]{1,}\.[0-9]{1,})'
                    var result = body.match(regex)
    
                    //Get our ID
                    var path = response.request.uri.pathname
                    var id = path.match('[0-9]{1,}')
                    
                    if(result !== null && result[2] !== null)
                    {
                        rates[id] = result[2]
                    }
                    else 
                    {
                        rates[id] = 2;
                    }
                }
                else{
                    console.log(error);
                }
            });
        }
    });
}

module.exports.updateRates = updateRates;  
module.exports.getRates = getRates;  