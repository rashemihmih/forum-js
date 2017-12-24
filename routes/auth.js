module.exports = function (app, db) {
    app.get('/', (req, res) => {
        // db.collection('users').insertOne({a: 'w'})
        res.send('ok')
    });
};