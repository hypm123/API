const jwt = require('jsonwebtoken');
require('dotenv').config();

const express = require('express');
const routes_pay = express.Router();
const mongoose = require('mongoose');
const userModel = require('../../Models/user');
const infoModel = require('../../Models/info');
const orderModel = require('../../Models/order');

var checkuser = (req, res, next)=> {
    if(req.body.apiKey != '' && req.body.clientid != ''){
        userModel.findOne({ 
            apiKey: req.body.apiKey,
            clientid:  req.body.clientid,
        })
        .then(data => {
            if (data) {
                req.balance = data.balance
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

var checkType = (req, res, next)=> {
    if(req.body.resType == 'ENERGY' ){ //|| req.body.resType == 'BANDWIDTH'){
        infoModel.findOne({ 

        })
        .then(data => {
            if (data) {
                if(data.Energy_Price>0.05 && data.Energy_Price < 0.1 && data.fee_Energy>0.00001 && data.fee_Energy < 0.00005){
                    req.fee_Energy = data.fee_Energy
                    req.Energy_Price = data.Energy_Price
                    req.privejwt = data.prive
                    req.adress = data.adress
                    req.resType = req.body.resType
                    next()
                }else{
                    res.status(500).json({ 'code': 0, 'message': 'server err fee_Energy or Energy_Price' })
                }
            } else {
                res.status(400).json({ 'code': 0, 'message': 'resType is not available.' })
            }
        })
        .catch(err => {
            res.status(500).json({ 'code': 0, 'message': 'Error api.' })
        });
    }else{
        res.status(400).json({ 'code': 0, 'message': 'err data resType' })
    }
}

var checkpayNums = (req, res, next)=> {
    var payNums = Number(req.body.payNums)
    if(payNums >= 32000 && payNums <= 320000){ 
        req.fee_order = payNums * req.fee_Energy
        req.amount = payNums * req.Energy_Price
        req.balanceNew = Number((req.balance - req.fee_order).toFixed(3))
        if(req.balanceNew >= 0){
            next()
        }else{
            res.status(400).json({ 'code': 0, 'message': 'balance is not available. fee: '+req.fee_order + ' USDT. balance: '+req.balance +' USDT' })
        }
    }else{
        res.status(400).json({ 'code': 0, 'message': 'err data payNums' })
    }
}

var checktoAdress = (req, res, next)=> {
    req.toAdress = req.body.toAdress
    if(req.toAdress !==''){ 
       next()
    }else{
        res.status(400).json({ 'code': 0, 'message': 'err data payNums' })
    }
}
// req.username      username
// req.balance      số dư now
// req.fee_Energy       0.00025 usdt/1
// req.Energy_Price         0.076 * 
// req.adress
// req.resType
// req.fee_order        fee USDT
// req.amount       fee TRX lock
// req.balanceNew
var buy_xxx = (req, res, next)=> {
    
    jwt.verify(req.privejwt, process.env.secretKey, async (err, decoded) =>  {
        if (err) {
            res.status(500).json({ 'code': 0, 'message': 'Error api.' })
        } else {
            req.prive = decoded.data
            var data = await buy_funaa(req.prive,req.adress,req.toAdress,req.amount,req.resType)
            if(data.code === true && data.toAddress == req.toAdress){
                userModel.findOneAndUpdate(
                    { username: req.username}, // Điều kiện tìm kiếm
                    { 
                        $set: { 
                            balance: req.balanceNew,
                        }
                    },
                    { new: true } // Tùy chọn để trả về bản ghi sau khi đã được cập nhật
                )
                .then(updatedOrder => {
                    if (updatedOrder) {
                        var date = Date.now()
                        orderModel.create({ 
                            username: req.username,
                            orderId: date*1000 + (Math.floor(Math.random() * 999) + 1),
                            orderType: req.resType, 
                            orderMoney: req.fee_order,
                            beforeBalance: req.balance ,
                            afterBalance: req.balanceNew,
                            createTime: date,
                            lockTime: 1,
                            recoveryTime: date + 1000 * 60 * 60,
                            toAddress: req.toAdress,
                            hash: data.hash,
                            ref_block_hash: data.ref_block_hash,
                            payNums: Number(req.body.payNums),
                            payLock: req.amount,
                            price_usdt: req.fee_Energy,
                            price_trxlock: req.Energy_Price
            
                        })
                        .then(data => {
                            redata= {
                                code: 1,
                                data:{
                                    orderId: data.orderId,
                                    balance: data.afterBalance,
                                    orderMoney: data.orderMoney,
                                    hash: data.hash
                                },
                                message: 'New Order successfully'
                            }
                            res.status(200).json(redata);
                        })
                    } else {
                        res.status(404).json({ 'code': 0, 'message': 'Order not found.' });
                    }
                })
                .catch(err => {
                    res.status(500).json({ 'code': 0, 'message': 'Error registering order.' })
                });
            }else{
                res.status(500).json(data)
            }
            
        }
    });
}

routes_pay.post('/pay', checkuser, checkType, checkpayNums,checktoAdress, buy_xxx, (req, res, next) => {


});

async function buy_funaa(privateKeyTron,address,toAddress, amount, resource) {
    amount = Number((amount*1000000).toFixed())
    var lock = false
    var lockPeriod = 1200
    try {
        const TronWeb = require('tronweb')
        const HttpProvider = TronWeb.providers.HttpProvider;
        const fullNode = new HttpProvider("https://api.trongrid.io");
        const solidityNode = new HttpProvider("https://api.trongrid.io");
        const eventServer = new HttpProvider("https://api.trongrid.io");
        const tronWeb = new TronWeb(fullNode, solidityNode, eventServer,privateKeyTron);

        const {max_size} = await tronWeb.trx.getCanDelegatedMaxSize(address, resource);
        if(max_size - 5 >amount){
            const transaction = await tronWeb.transactionBuilder.delegateResource(amount, toAddress, resource, address, lock, lockPeriod);   
            const signature = await tronWeb.trx.sign(transaction);
            var bandwidth_balance = await tronWeb.trx.getBandwidth(address);
            var bandwidth = estimateBandwidth(signature); //bandwidth sử dụng
            if(bandwidth_balance > bandwidth){
                const broadcast = await tronWeb.trx.sendRawTransaction(signature);
                if(broadcast.result === true){
                    return{
                        code: true,
                        hash: broadcast.txid,
                        ref_block_hash: broadcast.transaction.ref_block_hash,
                        toAddress: toAddress,
                    } 
                    
                }else{
                    return{
                        code: "1",
                        message: 'balance err1'
                    } 
                }
            }else{
                return{
                    code: "1",
                    message: 'balance bandwidth err'
                }
            }
            
        }else{
            return{
                code: "1",
                message: 'balance err'
            }
        }
    } catch (error) {
        return{
            code: "0",
            message: 'err'
        }
    }
    
} 

function estimateBandwidth(signedTxn)
{
    const DATA_HEX_PROTOBUF_EXTRA = 3;
    const MAX_RESULT_SIZE_IN_TX = 64;
    const A_SIGNATURE = 67;

    var len = signedTxn.raw_data_hex.toString().length /2 + DATA_HEX_PROTOBUF_EXTRA + MAX_RESULT_SIZE_IN_TX  ;
    var signatureListSize = signedTxn.signature.length;
    for(let i=0;i<signatureListSize;i++)
    {
        len += A_SIGNATURE;
    }
    return len;
} 

module.exports = routes_pay;

