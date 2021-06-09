const express=require("express");
const router=express.Router();
const homecontroller=require('../controller/home_controller.js');
const passport=require('passport');



router.get('/',passport.checkAuthentication,homecontroller.profile);
router.use('/users',require("./users.js"));

module.exports=router;