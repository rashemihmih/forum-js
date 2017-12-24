const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const db = require('./config/db');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

MongoClient.connect(db.url, (err, client) => {
    if (err) {
        return console.log(err);
    }
    require('./routes/routes')(app, client.db(db.name));
});

module.exports = app;
