
const {get, post} = require('./controller');
const  {getconsult} = require('../services')

module.exports = { 
    controller:{
        get: (req, res) =>
        get(req, res, getconsult)
    }
   
}
