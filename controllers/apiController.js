var uuid = require('uuid');
var nodemailer = require('nodemailer');
var events = require('events');
var eventEmitter = new events.EventEmitter();
//import models schema
var User = require('../models/user');
var TempUser = require('../models/tempuser');

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
      //gmail for sending the email 
        user: "digitalteamburda@gmail.com",
        pass: "Digital2016@@"
    }
});
var mailOptions,host,link;

module.exports = function(app){
    //sign up 
    /*
    body{
        username,
        email,
        password 
    }
    */
    app.post('/signup',function(req,res){
        var tempUser = new TempUser();
        User.findOne({'email':req.body.email},function(err,result){
            if(err){
                console.log(err);
            }else{
                if(result == null){
                    console.log('you can use this email');
                    User.findOne({'username': req.body.username},function(err,result){
                        if(err){
                            console.log(err)
                        }else{
                            if (result == null){
                                console.log('you can use this username');
                                eventEmitter.emit('Send');
                            }else{
                                res.end('this username is already taken');
                            }
                        }
                    })
                }else{
                    res.end('this email is already taken');
                }
            }
        });
        eventEmitter.on('Send',function(){
            var rand = uuid.v4();
            host=req.get('host');
            link = "http://"+req.get('host')+"/verify?id="+rand;
            mailOptions={
                to : req.body.email,
                subject : "Please confirm your email address",
                html: "Hello, <br> Please click on the link below to verify your email.<a href="+link+">Click here to verify</a>" 
            }
            console.log(mailOptions);
            tempUser.id = rand;
            tempUser.username = req.body.username;
            tempUser.email = req.body.email;
            tempUser.password = req.body.password;
            smtpTransport.sendMail(mailOptions,function(error,response){
                if(error){
                    console.log(error);
                    res.end(err);
                }else{
                    tempUser.save(function(err){
                        if(err){
                            res.end(err);
                        }else{
                            console.log('Save temp user already');
                            console.log('Wait for verify email');
                            res.end('Wait....');
                        }
                    });
                    console.log("Message sned: "+ response.message);
                }
            });
        })
    });
    //verify email address from the user
    app.get('/verify',function(req,res){
        console.log(req.protocol+':/'+req.get('host'));
        var db = User();
        var id;
        if((req.protocol+"://"+req.get('host'))==("http://"+host))
        {
            console.log("Domain is matched. Information is form Authentic email");
            TempUser.findOne({'id':req.query.id},function(err,result){
                if(err){
                    console.log(err);
                }else{
                    console.log('Found request');
                    db['username'] = result.username;
                    db['email'] = result.email;
                    db['password'] = db.generateHash(result.password);
                    id = result.id;
                    if(req.query.id == id){
                        db.save(function(err){
                            if(err){
                                console.log(err);
                            }else{
                                console.log('Save successfull');
                            }
                        });
                        TempUser.remove({'email':result.email},function(err){
                            if(err){
                                console.log(err);
                            }else{
                                console.log('Remove tempuser already');
                            }
                        });
                        console.log("Email is verified");
                        res.render('verifyPage',{data:result.email});
                        //res.end("Email "+result.email+" is been Successfully verified");
                    }
                    else{
                        console.log("email is not verified");
                        res.end("<h1>Bad Request</h1>");
                    }
                }
            });
        }else{
           res.end("<h1>Request is from unknown source</h1>");
        }
    });

    //show all users 
    app.get('/api/users',function(req,res){
        User.find({},function(err,result){
            if(err){
                console.log(err);
            }else{
                res.json(result);
            }
        })
    })


}