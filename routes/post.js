const response = require('../response');
const date = require('../date');
const ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {
    app.post('/api/post', (req, res) => {
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
                if (!req.body.message || !req.body.message) {
                    res.send(response.incorrectRequest('Параметры message, threadId обязательные'));
                    return;
                }
                return db.collection('posts').findOne({'_id': new ObjectID(req.body.parent)});
            }, () => res.send(response.dbError()))
            .then((parent) => {
                let time = date.getFormattedDate();
                let post = {
                    'user': login,
                    'message': req.body.message,
                    'threadId': req.body.threadId,
                    'creationTime': time,
                };
                if (parent) {
                    post.parent = req.body.parent;
                }
                db.collection('threads').updateOne({'_id': new ObjectID(req.body.threadId)},
                    {$set: {'lastUpdate': time}});
                return db.collection('posts').insertOne(post);
            }, () => {
                let time = date.getFormattedDate();
                let post = {
                    'user': login,
                    'message': req.body.message,
                    'threadId': req.body.threadId,
                    'creationTime': time,
                };
                db.collection('threads').updateOne({'_id': new ObjectID(req.body.threadId)},
                    {$set: {'lastUpdate': time}});
                return db.collection('posts').insertOne(post);
            })
            .then(() => res.send(response.ok()), () => res.send(response.dbError()))
    });

    app.get('/api/post/list', (req, res) => {
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
                let thread = req.query.thread;
                let offset = parseInt(req.query.offset, 10);
                let limit = parseInt(req.query.limit, 10);
                if (!thread || isNaN(offset) || isNaN(limit)) {
                    res.send(response.incorrectRequest('Параметры thread, offset, limit обязательные'));
                } else {
                    return db.collection('posts').find({'threadId': thread}).skip(offset).limit(limit).toArray()
                }
            }, () => res.send(response.dbError()))
            .then(posts => {
                if (posts) {
                    res.send(response.ok(posts))
                }
            }, () => res.send(response.dbError()));
    });
};