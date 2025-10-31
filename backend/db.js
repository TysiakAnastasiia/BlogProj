// db.js
const mysql = require('mysql2');

// створюємо підключення
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'Taysi',           
    password: 'T89sd95ia1127', 
    database: 'Blogdb'        
});

// підключаємося
connection.connect((err) => {
    if (err) {
        console.error('Помилка підключення до MySQL:', err.message);
        return;
    }
    console.log('Підключення до MySQL успішне!');
});

module.exports = connection;
