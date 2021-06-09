const nodeMailer=require('../config/nodemailer');

module.exports.newComment=(comment,user)=>{
    let htmlString=nodeMailer.renderTemplate({comment:comment,user:user},'/comments/newcomments.ejs');
    nodeMailer.transporter.sendMail({
        from:'QuotesPoint.com',
        to:user.email,
        subject:"New Comment Publish",
        html:htmlString},
        (err,info)=>{
            if(err){
                console.log('error in sending mail',err);
                return;
            }
            console.log('Message sent',info);
            return;
    });
}