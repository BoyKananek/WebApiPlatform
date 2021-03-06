var express = require('express');
var router = express.Router();
var uuid = require('uuid');
var nodemailer = require('nodemailer');
var events = require('events');
var jwt = require('jsonwebtoken');
var eventEmitter = new events.EventEmitter();
//import models schema
var User = require('../models/user');
var TempUser = require('../models/tempuser');
var RequestNewPassword = require('../models/request');
var config = require('../../config/database');
var Session = require('../models/session');

//config smtp email 
var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        //gmail for sending the email 
        user: "roundabulb@gmail.com",
        pass: "Ballboydewtan"
    }
});
var mailOptions, host, link;

/*
    parameter : {
        name : String,
        email : String,
        password : String
    }
*/
router.post('/signup', function (req, res) {
    var tempUser = new TempUser();

    User.findOne({ 'local.email': req.body.email }, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            if (result == null) {
                console.log('you can use this email');
                eventEmitter.emit('Send');
            } else {
                console.log('This email is already taken');
                res.end('this email is already taken');
            }
        }
    });
    eventEmitter.on('Send', function () {
        var rand = uuid.v4();
        host = req.get('host');
        link = "http://" + req.get('host') + "/api/verify?id=" + rand;
        mailOptions = {
            to: req.body.email,
            subject: "Please confirm your email address",
            html: "Hello, <br> Please click on the link below to verify your email.<a href=" + link + ">Click here to verify</a>"
        }
        console.log(mailOptions);
        tempUser.id = rand;
        tempUser.name = req.body.name;
        tempUser.email = req.body.email;
        tempUser.password = req.body.password;
        smtpTransport.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error);
                res.end(err);
            } else {
                tempUser.save(function (err) {
                    if (err) {
                        res.end(err);
                    } else {
                        console.log('Save temp user already');
                        console.log('Wait for verify email');
                        res.end('Wait....');
                    }
                });
                console.log("Message send: " + response.message);
            }
        });
    })
});
//verify email address from the user
router.get('/verify', function (req, res) {
    console.log(req.protocol + ':/' + req.get('host'));
    var db = User();
    var id;
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        console.log("Domain is matched. Information is form Authentic email");
        TempUser.findOne({ 'id': req.query.id }, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                if(result != null){
                    console.log('Found request');
                    db.local['name'] = result.name;
                    db.local['email'] = result.email;
                    db.local['password'] = db.generateHash(result.password);
                    id = result.id;
                    if (req.query.id == id) {
                        db.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Save successfull');
                            }
                        });
                        TempUser.remove({ 'email': result.email }, function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Remove tempuser already');
                            }
                        });
                        console.log("Email is verified");
                        res.render('verifyPage', { data: result.email });
                        //res.end("Email "+result.email+" is been Successfully verified");
                    }
                    else {
                        console.log("email is not verified");
                        res.end("<h1>Bad Request</h1>");
                    }
                }else{
                    res.end("<h1>This email is already verified.</h1>");
                }
            }
        });
    } else {
        res.end("<h1>Request is from unknown source</h1>");
    }
});

/////////////forget password system//////////////////////////////////////
/*
    parameter : {
        email : String
    }
*/
router.post('/forgotPassword', function (req, res) {
    User.findOne({ 'local.email': req.body.email }, function (err, result) {
        if (err) {
            res.end(err);
        } else {
            if (result == null) {
                res.json({ success: false, message: 'This email is not existing in the system' })
            } else {
                var requestPass = new RequestNewPassword();
                var rand = uuid.v4();
                host = req.get('host');
                link = "http://" + req.get('host') + "/api/requestNewPassword?id=" + rand;
                mailOptions = {
                    to: req.body.email,
                    subject: "Reset Password System",
                    html: "Hello,<br> Please click this link to go to reset password page.<br><a href=" + link + ">Click here to reset password</a>"
                }
                console.log(mailOptions);
                requestPass.id = rand;
                requestPass.email = req.body.email;
                smtpTransport.sendMail(mailOptions, function (error, response) {
                    if (error) {
                        console.log(error);
                        res.end(error);
                    } else {
                        requestPass.save(function (err) {
                            if (err) {
                                console.log(err);
                                res.end(err);
                            }
                            else {
                                console.log("Making a new request to request new password");
                                console.log('Wait...... for response from email');
                                res.json({ success: true, message: 'Please check your email address to continue' })
                            }
                        });
                        console.log("Message sent: " + response.message);
                    }
                });
            }
        }
    })
});

//request password 
router.get('/requestNewPassword', function (req, res) {

    console.log(req.protocol + ':/' + req.get('host'));
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
        //looking for request in database which one is match the id with the link
        RequestNewPassword.findOne({ 'id': req.query.id }, function (err, result) {
            if (err) {
                console.log(err);
            } else if (result != null){
                if (result.id == req.query.id) {
                    res.render('resetPassword', { 'email': result.email });
                } else {
                    res.end("Already done");
                }
            }else{
                res.end("Already done");
            }
        })
    } else {
        console.log("Already expired!");
        res.end("Already expired!");
    }
});
//update password 
router.post('/updatePassword', function (req, res) {
    var db = new User();
    console.log(req.body.email);
    var password = db.generateHash(req.body.password); // encode password 
    User.findOne({ 'local.email': req.body.email }, function (err, result) {
        if (err) {
            console.log(err);
            res.end(err);
        } else {
            //update password and hash password tobe encode
            console.log(result);
            if (result == null) {
                res.end("This email is not existed in the system");
            }
            else {
                result.update({
                    "local.password": password // update password
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.end(err);
                    } else {
                        console.log('Update password successfully');
                        RequestNewPassword.remove({ 'email': req.body.email }, function (req, result) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Remove request')
                            }
                        });
                        res.end('Changed');
                    }
                });
            }
        }
    })
    res.render('changePass');
});

////////////////////////Log in system ///////////////////////////////////
/*
    parameter:{
        username: String,
        password : String,
    }
    output :{
        if success
            return token
        else
            return not thing
    }
*/
router.post('/login', function (req, res) {
    var session = new Session();
    User.findOne({ 'local.email': req.body.email }, function (err, user) {
        if (err) throw err;
        if (!user) {
            //user not found
            res.json({ success: false, message: 'Authentication failed, email or password is incorrect.' });
        }
        else {
            //user found 
            if (!user.validPassword(req.body.password)) {
                res.json({ success: false, message: 'Authentication failed, email or password is incorrect' });
            }
            else {
                //log in successfull
                //create token for that User
                var token = jwt.sign(user, config.secret, {
                    expiresIn: 60 * 60 * 4
                });
                console.log('Login with email');
                session["type"] = "email";
                session['token'] = token;
                session['email'] = user.local.email;
                session['name'] = user.local.name;
                session['birthday'] = user.birthday;
                session['sign'] = user.sign;
                //create session for that user
                session.save(function (err) {
                    if (err) {
                        console.log(err);
                        res.end(err);
                    } else {
                        console.log("Login successfully");
                    }
                });

                res.json({
                    success: true,
                    token: token
                });
            }
        }
    });
});

/////////////////// Log out  create blacklist /////////////////////
// POST METHOD //
// send token long with the req.body //
/*
    Parameter:{
        token : String
    }

*/
router.post('/logout', function (req, res) {
    var token = req.body.token;
    var response = {};
    //find token is it in the blacklist or not
    Session.remove({ 'token': token }, function (err, result) {
        if (err) {
            console.log(err);
            response = err;
            res.json(response);
        } else {
            response = { "success": "true", "message": "Logout Successfully" };
            console.log('Remove Session');
            res.json(response);
        }
    });
})


module.exports = router;
