const { controller } =  require("../controllers");
const sellerRoutes =  require("./seller.routers")
module.exports = {
    sellerRoutes: (express) =>
        sellerRoutes(express, controller)
}

