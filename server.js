const mongoose = require('mongoose');
const fs = require("fs");
const express = require("express");
const bodyParser = require('body-parser')
const app = express();
// Require and load .env file
require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

// Đọc dữ liệu từ file config.json
fs.readFile("./config.json", "utf8", function(err, data) {
    if (err) {
        throw err;
    }
    // Parse dữ liệu JSON từ config.json
    var obj = JSON.parse(data);

    // Kết nối tới MongoDB
    mongoose.connect('mongodb+srv://' + obj.mongodb.username + ':' + obj.mongodb.password + '@' + obj.mongodb.server + '/' + obj.mongodb.dbname + '?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("Mongodb connected successfully.");

            var routes_balance = require('./Routes/API/balance')
            app.use('/api', routes_balance);

            var routes_orderHis = require('./Routes/API/order_his')
            app.use('/api', routes_orderHis);

            var routes_register = require('./Routes/API/register')
            app.use('/api', routes_register);

            var routes_pay = require('./Routes/API/pay')
            app.use('/api', routes_pay);

            var routes_auto = require('./Routes/auto')
            app.use('/api', routes_auto);

            app.get('/', (req, res, next) => {
                res.json('oke')
            })
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
        });
});

app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
