import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'T89sd95ia1127',
  database: 'blogdb',
});
