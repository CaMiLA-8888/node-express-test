require('dotenv').config()
const {serverConfig} =  require("./config");
serverConfig();

//data.json debe existir con el json inicial, un objeto que contiene una llave y su valor es un array vacio