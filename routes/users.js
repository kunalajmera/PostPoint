const express=require('express');
const router=express.Router();
const usercontroller=require('../controller/users_controller.js');
const passport=require('passport');

router.get('/sign_in',usercontroller.signin);
router.get('/sign_up',usercontroller.signup);

router.post('/create',usercontroller.create);
router.get('/post',usercontroller.post);
router.get('/signout',usercontroller.destroy);
router.post('/createsession',passport.authenticate('local',{failureRedirect:'/users/sign_in'},),usercontroller.createsession);
router.post('/createpost',usercontroller.createpost);
router.get('/updatepage',usercontroller.updatepage);
router.post('/createcomment',usercontroller.createcomment);
router.get('/deletepost/:id',passport.checkAuthentication,usercontroller.deletepost);
router.get('/deletecomment/:id',usercontroller.deletecomment);
router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/users/sign_in'}),usercontroller.directhome);
router.get('/like/',usercontroller.like);



module.exports=router;