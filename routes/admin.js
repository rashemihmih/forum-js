const response = require('../response');
const passwordEncoder = require('../password-encoder');
const ObjectID = require('mongodb').ObjectID;

module.exports = function (app, db) {
    app.post('/admin/session', (req, res) => {
        let login = req.body.login;
        let password = req.body.password;
        if (!login || !password) {
            res.send(response.incorrectRequest('Отсутствует логин или пароль'));
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (user && passwordEncoder.matches(password, user.password) && user.isAdmin) {
                    req.session.login = login;
                    res.send(response.ok(login));
                } else {
                    res.send(response.authError())
                }
            }, () => res.send(response.dbError()))
    });

    app.get('/admin/session', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (user && user.isAdmin) {
                    res.send(response.ok(login));
                } else {
                    res.send(response.authError())
                }
            }, () => res.send(response.dbError()))
    });

    app.delete('/admin/session', (req, res) => {
        let login = req.session.login;
        if (login && user.isAdmin) {
            req.session.login = undefined;
            res.send(response.ok(login));
        } else {
            res.send(response.authError())
        }
    });

    app.delete('/admin/user', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (!user || !user.isAdmin) {
                    res.send(response.authError());
                    return;
                }
                let login = req.body.login;
                db.collection('users').deleteOne({'login': login});
                db.collection('threads').deleteMany({'user': login});
                db.collection('posts').deleteMany({'user': login});
                return login;
            }, () => res.send(response.dbError()))
            .then((login) => res.send(response.ok(login)), () => res.send(response.dbError()))
    });

    app.post('/admin/forum', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (!user || !user.isAdmin) {
                    res.send(response.authError());
                    return;
                }
                let title = req.body.title;
                db.collection('forums').insertOne({'title': title});
                return title;
            }, () => res.send(response.dbError()))
            .then((title) => res.send(response.ok(title)), () => res.send(response.dbError()))
    });

    app.delete('/admin/forum', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (!user || !user.isAdmin) {
                    res.send(response.authError());
                    return;
                }
                let forum = req.body.forum;
                db.collection('forums').deleteOne({'title': forum});
                db.collection('threads').deleteMany({'forum': forum});
                return forum;
            }, () => res.send(response.dbError()))
            .then((forum) => res.send(response.ok(forum)), () => res.send(response.dbError()))
    });

    app.post('/admin/forum/rename', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (!user || !user.isAdmin) {
                    res.send(response.authError());
                    return;
                }
                let oldTitle = req.body.oldTitle;
                let newTitle = req.body.newTitle;
                db.collection('forums').updateOne({'title': oldTitle}, {$set: {'title': newTitle}});
                return newTitle;
            }, () => res.send(response.dbError()))
            .then((newTitle) => res.send(response.ok(newTitle)), () => res.send(response.dbError()))
    });

    app.delete('/admin/thread', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (!user || !user.isAdmin) {
                    res.send(response.authError());
                    return;
                }
                let thread = req.body._id;
                db.collection('threads').deleteOne({'_id': new ObjectID(thread)});
                db.collection('posts').deleteMany({'threadId': thread});
                return thread;
            }, () => res.send(response.dbError()))
            .then((thread) => res.send(response.ok(thread)), () => res.send(response.dbError()))
    });

    app.delete('/admin/post', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (!user || !user.isAdmin) {
                    res.send(response.authError());
                    return;
                }
                let post = req.body._id;
                db.collection('posts').deleteOne({'_id': new ObjectID(post)});
                return post;
            }, () => res.send(response.dbError()))
            .then((post) => res.send(response.ok(post)), () => res.send(response.dbError()))
    });
};