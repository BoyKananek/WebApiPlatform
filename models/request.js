var mongoose = require('mongoose');

var requestNewPassword = mongoose.Schema({
    id : String,
    email : String,
});

module.exports = mongoose.model('requestNewPassword',requestNewPassword);