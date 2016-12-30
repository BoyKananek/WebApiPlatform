var mongoose = require('mongoose');

var session = mongoose.Schema({
    type: String,
    token : String,
    email: String,
    name : String,
    birthday: String,
    picture: String,
    sign: String,
    createdAt: {
        type: Date,
        expires: 60*60*4,
        default: Date.now 
    }
});

module.exports = mongoose.model('session',session);