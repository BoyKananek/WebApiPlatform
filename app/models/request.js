var mongoose = require('mongoose');

var requestNewPassword = mongoose.Schema({
    id : String,
    email : String,
    createdAt: {
        type: Date,
        expires: 60*60*4,
        default: Date.now 
    }
});

module.exports = mongoose.model('requestNewPassword',requestNewPassword);