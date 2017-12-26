const auth = require('./auth');
const forum = require('./forum');
const thread = require('./thread');

module.exports = function (app, db) {
    auth(app, db);
    forum(app, db);
    thread(app, db);
};