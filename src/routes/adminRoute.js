var adminRouter = require('express').Router();
var staticController = require('../controller/staticController');

adminRouter.post('/getStaticContent', staticController.getStaticContent);
adminRouter.post('/updateStaticContent', staticController.updateStaticContent);
adminRouter.post('/deleteStaticContent', staticController.deleteStaticContent);


module.exports = adminRouter;