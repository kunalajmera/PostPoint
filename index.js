const express=require("express");
const cookieParser=require('cookie-parser');
const app=express();
const port=8000;
const expresslayouts=require('express-ejs-layouts');
const db=require('./config/mongoose.js');
//used for session cookie
const session=require('express-session');
const passport=require('passport');
const passportlocal=require('./config/passport-local-strategy.js');
const flash=require('connect-flash');
const customMware=require('./config/middleware');
const passportGoogle=require('./config/passport-google-oauth2-strategy.js');


app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static('./assets'));

//making upload available to browser
app.use('/uploads',express.static(__dirname+'/uploads'));

app.use(expresslayouts);

//extract style and script from subpages into the layout
app.set('layout extractStyles',true);
app.set('layout extractScripts',true);



app.set('view engine','ejs');
app.set('views','./views');


app.use(session({
    name:'Kunal',
    secret:'blah',
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:1000*60*100
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.setFlash);


//use express router
app.use('/',require("./routes/index.js"));

app.listen(port,function(err)
{
    if(err)
    {
        console.log(`error in running the server: ${err}`);
    }
    console.log(`server is running on port: ${port}`);
});