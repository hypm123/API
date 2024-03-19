const mongoose = require('mongoose');

const infoSchema = new mongoose.Schema({
    Energy_Price: {type: Number, default: 0.076},
    Bandwidth_Price: {type: Number, default: 0.909}, 
    fee_Energy: {type: Number, default: 0.8/32000}, // USDT
    fee_Bandwidth: {type: Number, default: 0.8}, //USDT
    registerDate: {type: Date, default: Date.now()},
    prive: {type: String, default: ''},
    adress: {type: String, default: ''}
});

module.exports = mongoose.model('info', infoSchema);

// req.balance      số dư now
// req.fee_Energy       0.00025 usdt/1
// req.Energy_Price         0.076 * 
// req.adress
// req.resType
// req.fee_order        fee USDT
// req.amount       fee TRX lock
// req.balanceNew