const auth = require('./auth');
const forum = require('./forum');

module.exports = function (app, db) {
    auth(app, db);
    forum(app, db);
};