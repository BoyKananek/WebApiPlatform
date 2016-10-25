var mongoose = require('mongoose');

var blackList = mongoose.Schema({
    token : String
});

module.exports = mongoose.model('blackList',blackList);