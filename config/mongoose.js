const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/authenjs_development');

const db=mongoose.connection;

db.on('error',console.error.bind(console,"Error connecting to mongdb"));

db.once('open',function(){
    console.log("connected to database::mongodb");
});


module.exports=db;