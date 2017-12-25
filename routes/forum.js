const response = require('../response');

module.exports = function (app, db) {
    app.get('/api/forum', (req, res) => {
        let login = req.session.login;
        if (login === undefined) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (user !== null) {
                    let title = req.query.title;
                    if (title === undefined || title === '') {
                        res.send(response.incorrectRequest('Название не должно быть пустым'));
                        return;
                    }
                    db.collection('forums').findOne({'title': title})
                        .then((forum) => {
                            if (forum !== null) {
                                res.send(response.ok(forum));
                            } else {
                                res.send(response.entryNotFound())
                            }
                        }, () => {
                            res.send(response.dbError())
                        })
                } else {
                    res.send(response.authError())
                }
            }, () => {
                res.send(response.dbError())
            });
    });

    app.get('/api/forum/list', (req, res) => {
        let login = req.session.login;
        if (login === undefined) {
            res.send(response.authError());
            return;
        }
        db.collection('users').find({'login': login}).toArray()
            .then((user) => {
                if (user !== null) {
                    db.collection('forums').find({}).toArray((err, forums) => {
                        if (err) {
                            res.send(response.dbError());
                        } else {
                            res.send(response.ok(forums));
                        }
                    });
                } else {
                    res.send(response.authError())
                }
            }, () => {
                res.send(response.dbError())
            });
    })
};