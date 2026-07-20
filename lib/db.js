import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function executeQuery(query, values = []) {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(query, values);
    connection.release();
    return results;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

export default pool;
