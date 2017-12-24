const auth = require('./auth');

module.exports = function (app, db) {
    auth(app, db);
};