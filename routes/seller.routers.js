function sellerRoutes(express, controller){
    const router = express.Router();
    console.log(controller);
    router.get('/getAll', (req,res)=>{
        controller.getAll(req,res);
    });
    router.get('/:id', (req,res)=>{
        controller.get(req,res);
    });
    router.post('/', (req,res)=>{
        controller.post(req,res);
    });
    return router;
}

module.exports = sellerRoutes;
