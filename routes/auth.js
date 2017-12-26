const response = require('../response');
const passwordEncoder = require('../password-encoder');

module.exports = function (app, db) {
    app.post('/api/user', (req, res) => {
        let login = req.body.login;
        let password = req.body.password;
        if (!login || !password) {
            res.send(response.incorrectRequest('Отсутствует логин или пароль'));
            return;
        }
        db.collection('users').insertOne({'login': login, 'password': passwordEncoder.encode(password)})
            .then(() => {
                req.session.login = login;
                res.send(response.ok(login))
            }, (err) => {
                if (err.message.startsWith('E11000')) {
                    res.send(response.duplicateEntry());
                } else {
                    res.send(response.dbError())
                }
            });
    });

    app.post('/api/session', (req, res) => {
        let login = req.body.login;
        let password = req.body.password;
        if (!login || !password) {
            res.send(response.incorrectRequest('Отсутствует логин или пароль'));
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (user && passwordEncoder.matches(password, user.password)) {
                    req.session.login = login;
                    res.send(response.ok(login));
                } else {
                    res.send(response.authError())
                }
            }, () => res.send(response.dbError()))
    });

    app.get('/api/session', (req, res) => {
        let login = req.session.login;
        if (!login) {
            res.send(response.authError());
            return;
        }
        db.collection('users').findOne({'login': login})
            .then((user) => {
                if (!user) {
                    res.send(response.ok(login));
                } else {
                    res.send(response.authError())
                }
            }, () => res.send(response.dbError()))
    });

    app.delete('/api/session', (req, res) => {
        let login = req.session.login;
        if (login) {
            req.session.login = undefined;
            res.send(response.ok(login));
        } else {
            res.send(response.authError())
        }
    })
};