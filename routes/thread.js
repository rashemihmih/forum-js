const response = require('../response');
const date = require('../date');
const ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {
    app.get('/api/thread', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then(user => {
                if (!user) {
                    res.send(response.authError());
                    return;
                }
                let _id = req.query._id;
                if (!_id) {
                    res.send(response.incorrectRequest('Параметр _id обязательный'));
                } else {
                    return db.collection('threads').findOne({'_id': new ObjectID(_id)})
                }
            })
            .then(thread => {
                if (thread) {
                    res.send(response.ok(thread));
                } else {
                    res.send(response.entryNotFound());
                }
            }, () => res.send(response.dbError()))
    });

    app.post('/api/thread', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        let thread = {};
        db.collection('users').findOne({'login': login})
            .then(user => {
                if (!user) {
                    res.send(response.authError());
                    return;
                }
                let forum = req.body.forum;
                let title = req.body.title;
                let message = req.body.message;
                if (!forum || !title || !message) {
                    res.send(response.incorrectRequest('Параметры forum, thread, message обязательные'));
                    return;
                }
                let time = date.getFormattedDate();
                thread = {
                    'forum': forum,
                    'title': title,
                    'message': message,
                    'user': user.login,
                    'creationTime': time,
                    'lastUpdate': time
                };
                return db.collection('threads').insertOne(thread)
            }, () => res.send(response.dbError()))
            .then(() => res.send(response.ok(thread)), () => res.send(response.dbError()))
    });

    app.get('/api/thread/list', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then(user => {
                if (!user) {
                    res.send(response.authError());
                    return;
                }
                let forum = req.query.forum;
                let offset = parseInt(req.query.offset, 10);
                let limit = parseInt(req.query.limit, 10);
                if (!forum || isNaN(offset) || isNaN(limit)) {
                    res.send(response.incorrectRequest('Параметры forum, offset, limit обязательные'));
                } else {
                    return db.collection('threads').find({'forum': forum}).skip(offset).limit(limit)
                        .sort({'lastUpdate': -1}).toArray()
                }
            }, () => res.send(response.dbError()))
            .then(threads => {
                if (threads) {
                    res.send(response.ok(threads))
                }
            }, () => res.send(response.dbError()));
    });
};