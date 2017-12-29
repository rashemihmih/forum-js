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
                if (user && passwordEncoder.matches(password, user.password) && (user.isAdmin || user.isMod)) {
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
                if (user && (user.isAdmin || user.isMod)) {
                    res.send(response.ok(login));
                } else {
                    res.send(response.authError())
                }
            }, () => res.send(response.dbError()))
    });

    app.delete('/admin/session', (req, res) => {
        let login = req.session.login;
        if (login && (user.isAdmin || user.isMod)) {
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
                if (!user || !user.isMod) {
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
                let title = req.body.title;
                db.collection('forums').deleteOne({'title': title});
                db.collection('threads').deleteMany({'forum': forum});
                res.send(response.ok(title));
            }, () => res.send(response.dbError()))
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
                if (!user || !user.isMod) {
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
                if (!user || !user.isMod) {
                    res.send(response.authError());
                    return;
                }
                let post = req.body._id;
                db.collection('posts').deleteOne({'_id': new ObjectID(post)});
                return post;
            }, () => res.send(response.dbError()))
            .then((post) => res.send(response.ok(post)), () => res.send(response.dbError()))
    });

    app.get('/admin/user/list', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (!user || !user.isMod) {
                    res.send(response.authError());
                    return;
                }
                return db.collection('users').find({}).toArray();
            }, () => res.send(response.dbError()))
            .then((users) => {
                if (users) {
                    users.forEach((user) => delete user.password);
                    res.send(response.ok(users))
                }
            }, () => res.send(response.dbError()))
    });

    app.post('/admin/user/mod', (req, res) => {
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
                let modLogin = req.body.login;
                let mod = req.body.mod;
                if (!modLogin || (mod !== true && mod !== false)) {
                    return response.incorrectRequest();
                }
                db.collection('users').updateOne({'login': modLogin}, {$set: {'isMod': mod}});
                return modLogin;
            }, () => res.send(response.dbError()))
            .then((modLogin) => {
                if (modLogin) {
                    res.send(response.ok(modLogin))
                }
            }, () => res.send(response.dbError()))
    });
};