const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const db = require('./config/db');

const app = express();
app.use(cors({credentials: true, origin: true}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    key: 'SESSION_ID',
    secret: Math.round((new Date().valueOf() * Math.random())) + ''
}));

MongoClient.connect(db.url, (err, client) => {
    if (err) {
        return console.log(err);
    }
    require('./routes')(app, client.db(db.name));
});

module.exports = app;
