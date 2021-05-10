function serverConfig( express, sellerRoutes, port){
    console.log(sellerRoutes);
    const app = express();
    let router = sellerRoutes(express);
    let routes = express.Router();
    router.use(express.json())
    routes.use('/seller',router)
    app.use('/api',routes);
    
    app.listen(port,function(){
      console.log('Server is running at PORT:',port);
    });
    
}
    
module.exports = serverConfig;