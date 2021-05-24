const express =  require("express");
const serverConfig = require("./serverConfig");
const {sellerRoutes} = require("../routes");
module.exports = { 
    serverConfig: () =>
        serverConfig(express, sellerRoutes , process.env.PORT)
}
