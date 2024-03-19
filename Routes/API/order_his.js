const jwt = require('jsonwebtoken');
require('dotenv').config();

const express = require('express');
const routes_orderhistory = express.Router();
const mongoose = require('mongoose');
const userModel = require('../../Models/user');
const orderModel = require('../../Models/order');

var checkuser = (req, res, next)=> {
    if(req.body.apiKey != '' && req.body.clientid != ''){
        userModel.findOne({ 
            apiKey: req.body.apiKey,
            clientid:  req.body.clientid,
        })
        .then(data => {
            if (data) {
                req.username = data.username
                next()
            } else {
                res.status(400).json({ 'code': 0, 'message': 'apiKey or clientid is not available.' })
            }
        })
        .catch(err => {
            res.status(500).json({ 'code': 0, 'message': 'Error api.' })
        });
    }else{
        res.status(400).json({ 'code': 0, 'message': 'err data' })
    }
}

var getdata = (req, res, next)=> {
    orderModel.find({ 
        username: req.username
    })
    .then(data => {
        if (data.length>0) {
            let data2 = data.map(item => ({
                orderId: item.orderId,
                orderType: item.orderType,
                orderMoney: item.orderMoney,
                beforeBalance: item.beforeBalance,
                afterBalance: item.afterBalance,
                createTime: item.createTime,
                lockTime: item.lockTime,
                recoveryTime: item.recoveryTime,
                toAddress: item.toAddress,
                hash: item.hash,
                state: item.state,
                payNums: item.payNums,
                price_usdt: item.price_usdt
            }));
            res.status(200).json({ 'code': 1,'total':data2.length,'data':data2 ,'message': '' })
        } else {
            res.status(200).json({ 'code': 1,'total':data.length,'data':[] ,'message': '' })
        }
    })
    .catch(err => {
        res.status(500).json({ 'code': 0, 'message': 'Error api.' })
    });
}


routes_orderhistory.post('/orderhistory', checkuser, getdata, (req, res, next) => {


});

module.exports = routes_orderhistory;

