const passport=require('passport');
const googleStrategy=require('passport-google-oauth').OAuth2Strategy;
const crypto=require('crypto');
const User=require('../models/user.js');


//tell passport to use a new strategy for google login
passport.use(new googleStrategy({
    clientID:"499816588809-bml02ctjlij08p2o3vs4fk1mu96gncev.apps.googleusercontent.com",
    clientSecret:"KSqXal8NJX2nAb8-BfaewCJc",
    callbackURL:"http://localhost:8000/users/auth/google/callback",
},
function(accessToken,refreshToken,profile,done){
    //find a user
    User.findOne({email:profile.emails[0].value}).exec(function(err,user){
        if(err){console.log('error in google strategy-passport',err);return;}
        console.log(profile);
        if(user){
            //if found, set this user as req.user
            return done(null,user);
        }
        else{
            //if not found then create the user
            User.create({
               
                email:profile.emails[0].value,
                password:crypto.randomBytes(20).toString('hex'),
                name:profile.displayName,
            },function(err,user){
                if(err){console.log('error in google strategy-passport',err);return;}
                return done(null,user);
            });
        }
    });
}
));




module.exports=passport;