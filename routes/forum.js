const response = require('../response');

module.exports = function (app, db) {
    app.get('/api/forum', (req, res) => {
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
                let title = req.query.title;
                if (!title) {
                    res.send(response.incorrectRequest('Название не должно быть пустым'));
                    return;
                }
                return db.collection('forums').findOne({'title': title})
            }, () => res.send(response.dbError()))
            .then((forum) => {
                if (forum) {
                    res.send(response.ok(forum));
                } else {
                    res.send(response.entryNotFound())
                }
            }, () => res.send(response.dbError()));
    });

    app.get('/api/forum/list', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (user) {
                    return db.collection('forums').find({}).toArray();
                } else {
                    res.send(response.authError())
                }
            }, () => res.send(response.dbError()))
            .then((forums) => {
                if (forums) {
                    res.send(response.ok(forums))
                }
            }, () => res.send(response.dbError()));
    })
};