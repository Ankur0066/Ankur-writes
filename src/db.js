const mysql = require('mysql2/promise');
const fs = require('fs');

// Support optional SSL settings for cloud providers (e.g., Aiven)
const useSsl = (process.env.DB_SSL && (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'REQUIRED')) || false;
let sslOption = undefined;
if (useSsl) {
  // DB_SSL_CA_PATH: path to CA pem file (optional)
  if (process.env.DB_SSL_CA_PATH) {
    try {
      const ca = fs.readFileSync(process.env.DB_SSL_CA_PATH, 'utf8');
      sslOption = { ca };
    } catch (err) {
      console.warn('Failed to read DB_SSL_CA_PATH:', err.message);
      // fallback to minimal ssl option
      sslOption = { rejectUnauthorized: false };
    }
  } else if (process.env.DB_SSL_CA_BASE64) {
    try {
      const ca = Buffer.from(process.env.DB_SSL_CA_BASE64, 'base64').toString('utf8');
      sslOption = { ca };
    } catch (err) {
      console.warn('Failed to decode DB_SSL_CA_BASE64:', err.message);
      sslOption = { rejectUnauthorized: false };
    }
  } else {
    // minimal option to enable TLS without specifying CA
    sslOption = { rejectUnauthorized: false };
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'blog_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslOption,
});

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function withTransaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { pool, query, withTransaction };
