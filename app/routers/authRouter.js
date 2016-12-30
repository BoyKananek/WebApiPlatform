var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var events = require('events');
var eventEmitter = new events.EventEmitter();
//import database file
var config = require('../../config/database');
var User = require('../models/user');
var Session = require('../models/session');
var request = require('request');

/////////////////////////////Log in first//////////////////////////////////////
router.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    //to check the request before response to client 
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                res.json({ success: false, message: 'Failed to authenticate token' });
            }
            else {
                //if token verify the system will decoded and send the response back to client
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        res.json({
            success: false,
            message: 'No token provided.'
        });

    }
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