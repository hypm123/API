const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    apiKey: String,
    clientid: String,
    balance: {type: Number, default: 0},
    id_te: {type: String, default: ''},
    image: {type: String, default: ''},
    active: {type: Boolean, default: true},
    registerDate: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('user', userSchema);