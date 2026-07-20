import mysql from 'mysql2/promise';

/**
 * TLS settings for the connection pool.
 *
 * Managed providers such as Aiven refuse unencrypted connections
 * ("Connections using insecure transport are prohibited"), while a local
 * XAMPP/MySQL install has no certificate at all. So SSL is opt-in:
 *
 *   MYSQL_SSL=true      turn TLS on (required for Aiven)
 *   MYSQL_SSL_CA=<PEM>  the provider's CA certificate, which additionally
 *                       verifies you are talking to the real server
 *
 * Without a CA the traffic is still encrypted, but the server's identity is
 * not verified — fine to get running, worth fixing for production.
 */
function sslOptions() {
  const flag = String(process.env.MYSQL_SSL || '').toLowerCase();
  const host = process.env.MYSQL_HOST || '';
  const enabled =
    flag === 'true' || flag === 'required' || host.includes('aivencloud.com');

  if (!enabled) return undefined;

  const ca = process.env.MYSQL_SSL_CA;
  if (ca && ca.includes('BEGIN CERTIFICATE')) {
    return { ca, rejectUnauthorized: true };
  }

  return { rejectUnauthorized: false };
}

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: sslOptions(),
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
