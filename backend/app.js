const express = require('express');
const app = express();
const db = require('./db');

app.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('Сервер запущено на http://localhost:3000');
});
