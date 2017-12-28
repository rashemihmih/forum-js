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
            .then((user) => {
                if (!user) {
                    res.send(response.authError());
                    return;
                }
                let message = req.body.message;
                let threadId = req.body.threadId;
                if (!message || !threadId) {
                    res.send(response.incorrectRequest('Параметры message, threadId обязательные'));
                    return;
                }
                let time = date.getFormattedDate();
                let post = {
                    'user': user.login,
                    'message': message,
                    'threadId': threadId,
                    'parent': req.body.parent,
                    'creationTime': time,
                };
                db.collection('threads').updateOne({'_id': new ObjectID(threadId)}, {$set: {'lastUpdate': time}});
                return db.collection('posts').insertOne(post);
            }, () => res.send(response.dbError()))
            .then(() => res.send(response.ok()), () => res.send(response.dbError()))
    });

    app.get('/api/post/list', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
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
            .then((posts) => {
                if (posts) {
                    res.send(response.ok(posts))
                }
            }, () => res.send(response.dbError()));
    });
};