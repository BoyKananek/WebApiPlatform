var mongoose = require('mongoose');

var blackList = mongoose.Schema({
    token : String,
    createdAt: {
        type: Date,
        expires: 60*60*4,
        default: Date.now 
    }
});

module.exports = mongoose.model('blackList',blackList);