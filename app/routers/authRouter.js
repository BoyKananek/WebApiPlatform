var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

//import database file
var config = require('../../config/database');
var User = require('../models/user');

/////////////////////////////Log in first//////////////////////////////////////
router.use(function(req,res,next){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token){
        jwt.verify(token,config.secret,function(err,decoded){
            if (err){
                return res.json({success: false,message: 'Failed to authenticate token'});
            }else{
                req.decoded = decoded;
                next();
            }
        });
    }
    else{
        return res.status(403).send({
            success:false,
            message: 'No token provided.'
        });
    }
});

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