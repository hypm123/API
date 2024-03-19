const jwt = require('jsonwebtoken');
require('dotenv').config();

const express = require('express');
const routes_register = express.Router();
const mongoose = require('mongoose');
const userModel = require('../../Models/user');
const infoModel = require('../../Models/info');
// Bcryptjs
const bcrypt = require('bcryptjs');

const { v4: uuidv4 } = require('uuid');

function generateApiKey() {
    const uuid = uuidv4();
    // Định dạng chuỗi theo định dạng mong muốn
    return uuid; // Ví dụ: Chuyển chuỗi UUID 
}


var checkuser = (req, res, next)=> {
    if(req.body.username.length>=5){
        if(req.body.username.length <= 15){
            next()
        }else{
            res.status(400).json({ 'code': 0, 'message': 'Max length username is 15.' })
        }
    }else{
        res.status(400).json({ 'code': 0, 'message': 'Min length username is 5.' })
    }
}

var checkpass = (req, res, next)=> {
    if(req.body.password.length>=5){
        if(req.body.password.length<=20){
            next()
        }else{
            res.status(400).json({ 'code': 0, 'message': 'Max length passwold is 20.' })
        }
    }else{
        res.status(400).json({ 'code': 0, 'message': 'Min length passwold is 5.' })
    }
}

routes_register.post('/register', checkuser, checkpass, (req, res, next) => {
    var username = req.body.username;
    var password = req.body.password;
    userModel.findOne({ 
        username: username 
    })
    .then(data => {
        if (data) {
            res.status(400).json({ 'code': 0, 'message': 'Username is not available.' })
        } else {

            bcrypt.hash(password, 10, function(err, hash) {
                userModel.create({ 
                    username: username, 
                    password: hash,
                    apiKey: generateApiKey(),
                    clientid: generateApiKey(),
                })
                .then(data => {
                    console.log(data)
                    res.status(200).json({ 'code': 1, 'message': 'User registered successfully.' })
                })
            });  
        }
    })
    .catch(err => {
        res.status(500).json({ 'code': 0, 'message': 'Error registering user.' })
    });
});

module.exports = routes_register;
