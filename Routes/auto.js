const jwt = require('jsonwebtoken');
require('dotenv').config();

const express = require('express');
const routes_auto = express.Router();
const mongoose = require('mongoose');
const infoModel = require('../Models/info');
const orderModel = require('../Models/order');

auto()

function auto(){
    orderModel.find({ 
        state: "prossing",
        recoveryTime: { $lt: Date.now()+5000 } 
    })
    .then(async  data => {

        if (data && data.length > 0) { // Kiểm tra xem có dữ liệu được tìm thấy không
            amount = data[0].payLock
            resource = data[0].orderType
            toAddress = data[0].toAddress
            hash = data[0].hash

            infoModel.find({ 

            })
            .then(async  data => {
                if (data && data.length > 0) { // Kiểm tra xem có dữ liệu được tìm thấy không

                    address = data[0].adress
                    jwt.verify(data[0].prive, process.env.secretKey, async (err, decoded) =>  {
                        if (err) {
                            console.log('err')
                        } else {
                            privateKeyTron = decoded.data
                            var check_data = await buy_funaa(privateKeyTron,address,toAddress, amount, resource)
                            if(check_data.code === true && check_data.toAddress == toAddress){
                                orderModel.findOneAndUpdate(
                                    { hash: hash}, // Điều kiện tìm kiếm
                                    { 
                                        $set: { 
                                            state: 'end',
                                        }
                                    },
                                    { new: true } // Tùy chọn để trả về bản ghi sau khi đã được cập nhật
                                )
                                .then(updatedOrder => {
                                    if (updatedOrder.state == 'end') {
                                        console.log('oke')
                                        setTimeout(auto, 5000);
                                    } else {
                                        res.status(404).json({ 'code': 0, 'message': 'Order not found.' });
                                    }
                                })
                            }else{
                                 orderModel.findOneAndUpdate(
                                    { hash: hash}, // Điều kiện tìm kiếm
                                    { 
                                        $set: { 
                                            state: 'err',
                                        }
                                    },
                                    { new: true } // Tùy chọn để trả về bản ghi sau khi đã được cập nhật
                                )
                                .then(updatedOrder => {
                                    if (updatedOrder.state == 'err') {
                                        console.log('err')
                                        setTimeout(auto, 5000);
                                    } else {
                                        res.status(404).json({ 'code': 0, 'message': 'Order not found.' });
                                    }
                                })
                            }
                        }
                    })
                } else {
                    console.log('errr')
                }
            })
        } else {
            setTimeout(auto, 5000);
        }
    })
    .catch(error => {
        console.log('Error check time');
    });
}
async function buy_funaa(privateKeyTron,address,toAddress, amount, resource) {
    amount = Number((amount*1000000).toFixed())
    try {
        const TronWeb = require('tronweb')
        const HttpProvider = TronWeb.providers.HttpProvider;
        const fullNode = new HttpProvider("https://api.trongrid.io");
        const solidityNode = new HttpProvider("https://api.trongrid.io");
        const eventServer = new HttpProvider("https://api.trongrid.io");
        const tronWeb = new TronWeb(fullNode, solidityNode, eventServer,privateKeyTron);

        const transaction = await tronWeb.transactionBuilder.undelegateResource(amount, toAddress, resource, address);   
        const signature = await tronWeb.trx.sign(transaction);
        var bandwidth_balance = await tronWeb.trx.getBandwidth(address);
        var bandwidth = estimateBandwidth(signature); //bandwidth sử dụng
        // check = await tronWeb.trx.getDelegatedResourceV2(address, toAddress)
        if(bandwidth_balance > bandwidth){
            // const broadcast = await tronWeb.trx.sendRawTransaction(signature);
            var broadcast = {
                result: true,
                txid: 'e7da84877bfa0158b1eb8810bc0e3c9d36c61e19b5b3b246323b45971dcc97aa',
                transaction: {
                    visible: false,
                    txID: 'e7da84877bfa0158b1eb8810bc0e3c9d36c61e19b5b3b246323b45971dcc97aa',
                    raw_data_hex: '0a023dcb22087e74d966acca37df40f0928994e5315a720839126e0a35747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e44656c65676174655265736f75726365436f6e747261637412350a1541971ff6b1b0f8bb13780d7646d58589a303d1f62510011880ade204221541fc17285dc8ab86f344a5bd37af730295e26198827090be8594e531',
                    raw_data: {
                    contract: [Array],
                    ref_block_bytes: '3dcb',
                    ref_block_hash: '7e74d966acca37df',
                    expiration: 1710781254000,
                    timestamp: 1710781194000
                    },
                    signature: [
                    '5076ab832e755bf09e2249e9bdba284f94afa34ce79490520ac20474520c0ab64e9f551ae942452a935ad604fda959f9dbf3382c2cbc27253330a3ae2cd76c4f1C'
                    ]
                }
            }
            if(broadcast.result === true){
                return{
                    code: true,
                    hash: broadcast.txid,
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

module.exports = routes_auto;

