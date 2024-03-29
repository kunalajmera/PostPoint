const passport=require('passport');
const User=require('../models/user.js');
const LocalStrategy=require('passport-local').Strategy;

//authentication using passport
passport.use(new LocalStrategy({
    usernameField:'email',
    passReqToCallback:true
},
function(req,email,password,done)
{
//find a user and establish the identity
User.findOne({email:email},function(err,user){
    if(err)
    {
        req.flash('error',err);
        return done(err);
    }
    if(!user || user.password!=password)
    {
        req.flash('error','Invalid Username/Password');
        return done(null,false);
    }
    req.flash('success','Logged in');
    return done(null,user);
});
}
));

//serializing the user to decide which key is to be kept in the cookies
passport.serializeUser(function(user,done)
{
    return done(null,user.id);
});

//deserialising the user from the key in the cookies
passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
    if(err)
    {
        console.log("Error in finding user");
        return done(err);
    }
    return done(null,user);
});
});

//check if the user is authenticated
passport.checkAuthentication=function(req,res,next)
{
    //if user is signin thenpass to next functioncontroller's action
    if(req.isAuthenticated())
    {
        return next();
    }
    //if user is not signin
    return res.redirect('/users/sign_in');
}

passport.setAuthenticatedUser=function(req,res,next){
    if(req.isAuthenticated())
    {
        //req.user contain the current sign in user
        res.locals.user=req.user;
    }
    next();
}


module.exports=passport;