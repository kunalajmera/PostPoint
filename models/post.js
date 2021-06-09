const mongoose=require('mongoose');
const multer=require('multer');
const path=require('path');
const AVATAR_PATH=path.join('/uploads/users/avatars');

const PostSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }],
    like:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Like'
    }],
    avatar:{
        type:String
    }
},{timestamps:true});

let storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'..',AVATAR_PATH));
    },
    filename:function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now());
    }
});


PostSchema.statics.uploadedAvatar=multer({storage:storage}).single('myfile');
PostSchema.statics.avatarPath=AVATAR_PATH;

const Post=mongoose.model('Post',PostSchema);
module.exports=Post;