const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    username:String,
    orderId: Number, // 1710602422325872
    orderType: String, // ENERGY or
    orderMoney: String, // 32000 X 39 \/ 1000000 ≈ 1.25 USDT
    beforeBalance: Number, // 246.87 TRX
    afterBalance: Number, // 246.87 TRX

    createTime: Number, // 2024-03-18 20:43:53
    lockTime: Number, //1 hours
    recoveryTime: Number, // thời gian hết // 2024-03-18 21:43:53,

    toAddress: String, // TCr8eMAjSEY9VYZTSsYmc79xWVXWh16z6Q
    hash: String, // b1d04c2cd88144c5be6995b07dc55a3fd3313d4bd4c0aa0476b638945107b50a
    ref_block_hash:String, //ccf5f03722f44b13

    state: {type: String, default: "prossing"},
    payNums: Number, // 32000
    payLock: Number, // TRX lock
    price_usdt: Number, // 39
    price_trxlock: Number, // 39

    

    orderNotes: {type: String, default: ""},
    transactionId: {type: String, default: ""},
    rentTimeLock: {type: Number, default: 0},
});
module.exports = mongoose.model('order', orderSchema);