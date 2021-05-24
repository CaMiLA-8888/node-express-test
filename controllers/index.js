
const fs = require('fs');
const {get, getAll, post} = require('./controller');
const  {getconsult} = require('../services')

module.exports = { 
    controller:{
        get: (req, res) =>
            get(req, res, fs),
        getAll: (req, res) =>
            getAll(req, res, fs),
        post: (req, res) =>
            post(req, res, getconsult, fs)
    }
   
}
