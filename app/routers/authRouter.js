var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var events = require('events');
var eventEmitter = new events.EventEmitter();
//import database file
var config = require('../../config/database');
var User = require('../models/user');
var BlackList = require('../models/blacklist');

/////////////////////////////Log in first//////////////////////////////////////
router.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    //find token (Is it in the blacklist or not?)
    BlackList.findOne({ 'token': token }, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            if (result) {
                //if it is 
                console.log('found token in blacklist');
                res.json({ success: false, message: 'This token had already logged out' });
            } else {
                //if it is not
                eventEmitter.emit('authenticate');
            }
        }
    });
    //when it trigger the event start 
    //to check the request before response to client 
    eventEmitter.on('authenticate', function () {
        if (token) {
            jwt.verify(token, config.secret, function (err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token' });
                }
                else {
                    //if token verify the system will decoded and send the response back to client
                    req.decoded = decoded;
                    next();
                }
            });
        }
        else {
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }

    });
});
// client should send the token along with url in params
/*
    key : token 
    value : token string variable
*/
router.get('/users', function (req, res) {
    User.find({}, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    })
})

module.exports = router;