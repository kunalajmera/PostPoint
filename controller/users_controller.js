const User=require('../models/user.js');
const Comment=require('../models/comment.js');
const Post = require('../models/post.js');
const Like=require('../models/like.js');
const fs=require('fs');
const path=require('path');
const commentsMailer=require('../mailer/comments_mailer.js');
const commentsPost=require('../mailer/Post_mailer.js');
const commentonPost=require('../mailer/postofcomment.js');


module.exports.profile=function(req,res){
    return res.render('user_profile',{
        title:'Kunal'
    });
}

module.exports.signin=function(req,res){
    if(req.isAuthenticated())
    {
        return res.redirect('/');
    }
    return res.render('user_sign_in',{
        title:'sign-in'
    });
}


module.exports.signup=function(req,res)
{
    if(req.isAuthenticated())
    {
        return res.redirect('/');
    }
    return res.render('user_sign_up',{
        title:'sign-up'
    });
}

module.exports.create=function(req,res)
{
    if(req.body.password != req.body.confirmpassword)
    {
        req.flash('error','confirm password did not match');
        return res.redirect('back');
    }
    User.findOne({email: req.body.email},function(err,user){
        if(err)
        {
            console.log("error in finding user in signing up");
            return res.redirect('back');
        }
        if(!user)
        {
            User.create({email:req.body.email,name:req.body.username,password:req.body.password},function(err,user){
                if(err)
                {
                    console.log("error in creating user while signing up");
                    return;
                }
                return res.redirect('/users/sign_in');
            })
        }
        else
        {
            return res.redirect('back');
        }
    })
}

module.exports.createsession=function(req,res){
    req.flash('success','Logged in Successfully');
    User.findOne({email: req.body.email},function(err,user){
        
        Post.find({}).populate('user').populate({path:'comments',populate:{path:'user'}}).
        exec(function(err,posts){
           
            return res.render('home',{
                title:"authenjs",
                posts:posts,
                user:user,
            });
        });
});
}
module.exports.directhome=function(req,res){
    User.findById(req.user._id,function(err,user){
        
        Post.find({}).populate('user').populate({path:'comments',populate:{path:'user'}}).
        exec(function(err,posts){
           
            return res.render('home',{
                title:"authenjs",
                posts:posts,
                user:user,
            });
        });
});
}
module.exports.destroy=function(req,res){
    req.logout();
    req.flash('success','you have logged out!');


    return res.redirect('/users/sign_in');
}

module.exports.post=function(req,res){
    if(req.isAuthenticated())
    {
    return res.render('post',{
        title:'POST'
    });
}
return res.redirect('/users/sign_in');
}

module.exports.createpost=function(req,res){
    //req.body can only be used inside Post.uploadAvatar in case of multer
        Post.uploadedAvatar(req,res,function(err){
            if(err){
                console.log('****Multer Error:',err);
            }
            Post.create({title:req.body.title,content:req.body.blog,user:req.user._id,avatar:Post.avatarPath+'/'+req.file.filename},function(err,post){
                if(err)
                {
                    console.log('error in creating post');
                }
                else
                {
                    User.findById(post.user,function(err,user){
                        commentsPost.newPost(post,user);
                        res.redirect('/users/updatepage');
                    });
                   
                }
            });
        });
}
module.exports.updatepage=function(req,res){
    Post.find({}).populate('user').populate({
        path:'comments',
        populate:{
            path:'user'
        },
        populate:{
            path:'like'
        }
    }).populate('like')
    .exec(function(err,posts){
        return res.render('home',{
            title:"authenjs",
            posts:posts
        });
    });
}
module.exports.createcomment=function(req,res)
{
    Post.findById(req.body.post,function(err,posts){
        if(posts){
            Comment.create({
                content:req.body.comment,
                user:req.user._id,
                post:req.body.post
            },function(err,comment){
                posts.comments.push(comment._id);
                posts.save();
                User.findById(comment.user,function(err,user){
                    commentsMailer.newComment(comment,user);
                    User.findById(posts.user,function(err,user){
                        commentonPost.newPost(posts,user);
                        return res.redirect('/users/updatepage');
                    });
                  
                });
               
            });
        }
    });
}
module.exports.deletepost=function(req,res){
    Post.findById(req.params.id).populate({
        path:'comments',
        populate:{
            path:'user'
        },
        populate:{
            path:'like'
        }
    }).populate('like').exec(function(err,posts){
        if(posts.user==req.user.id)
        {
            fs.unlinkSync(path.join(__dirname,'..',posts.avatar));
            Like.deleteMany({Likeable:posts._id,onModel:'Post'},function(err){
                Like.deleteMany({Likeable:{$in:posts.comments},onModel:'Comment'},function(err){
                    posts.remove();
                Comment.deleteMany({post:req.params.id},function(err){
                    return res.redirect('/users/updatepage');
                });
                });
                
            });
           
        }
       else
       {
           return res.redirect('/users/updatepage');
       }
    });
}
module.exports.deletecomment=function(req,res){
    Comment.findById(req.params.id,function(err,comments){
        if(comments.user==req.user.id){
            let postId=comment.post;
            Like.deleteMany({likeable:comments,onModel:'Comment'});
            comments.remove();
            Post.findByIdAndUpdate(postId,{$pull:{comments:req.params.id}},function(err,post){
                return res.redirect('/users/updatepage');
            });
        }else
        {
        return res.redirect('/users/updatepage');
        }
    });
}


module.exports.like=function(req,res){
  
    if(req.query.type=="Post"){
      Post.findById(req.query.id).populate('like').exec(function(err,likeable){
        Like.findOne({
            user:req.user._id,
            Likeable:req.query.id,
            onModel:req.query.type
        },function(err,existinglike){
            if(existinglike)
        {
            likeable.like.pull(existinglike._id);
            likeable.save();
            existinglike.remove();
        }
        else{
            Like.create({
                user:req.user._id,
                Likeable:req.query.id,
                onModel:req.query.type
            },function(err,newlike){
                likeable.like.push(newlike);
                likeable.save();
            });
           
        }
        return res.redirect('/users/updatepage');
        });
      });
    }
    else
    {
        Comment.findById(req.query.id).populate('like').exec(function(err,likeable){
            Like.findOne({
                user:req.user._id,
                Likeable:req.query.id,
                onModel:req.query.type
            },function(err,existinglike){
                if(existinglike)
            {
                likeable.like.pull(existinglike._id);
                likeable.save();
                existinglike.remove();
            }
            else{
                Like.create({
                    user:req.user._id,
                    Likeable:req.query.id,
                    onModel:req.query.type
                },function(err,newlike){
                    likeable.like.push(newlike);
                    likeable.save();
                });
               
            }
            return res.redirect('/users/updatepage');
            });
          });
    }
    
    
}
