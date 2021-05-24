const axios  =  require('axios');
const { getconsult }= require('./getservice');

module.exports = { 
    getconsult: (url,options) =>
        getconsult(axios, url,options)
}
