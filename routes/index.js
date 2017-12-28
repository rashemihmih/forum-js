const auth = require('./auth');
const forum = require('./forum');
const thread = require('./thread');
const post = require('./post');
const admin = require('./admin');

module.exports = function (app, db) {
    auth(app, db);
    forum(app, db);
    thread(app, db);
    post(app, db);
    admin(app, db);
};