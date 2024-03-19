const jwt = require('jsonwebtoken');
require('dotenv').config();

const express = require('express');
const routes_balance = express.Router();
const mongoose = require('mongoose');
const userModel = require('../../Models/user');

routes_balance.post('/balance', (req, res, next) => {
    if(req.body.apiKey != '' && req.body.clientid != ''){
        userModel.findOne({ 
            apiKey: req.body.apiKey,
            clientid:  req.body.clientid,
        })
        .then(data => {
            if (data) {
                req.balance = data.balance
                res.json({ 'code': 1,'data':{'balance': data.balance,'type':'USDT'}, 'message': '' })
            } else {
                res.status(400).json({ 'code': 0, 'message': 'apiKey or clientid is not available.' })
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({ 'code': 0, 'message': 'Error api.' })
        });
    }else{
        res.status(400).json({ 'code': 0, 'message': 'err data' })
    }

});

module.exports = routes_balance;

