// api/login.js (Vercel Serverless Function)
const mysql = require('mysql2/promise');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { username, pass } = req.body;

  try {
    // Koneksi ke database TiDB Cloud kamu
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,         // Masukkan environment variable di Vercel
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'test',
      port: process.env.DB_PORT || 4000,
      ssl: { rejectUnauthorized: true }  // Biasanya dibutuhkan oleh TiDB Cloud
    });

    // Cek data admin di database (Asumsi tabel admin atau t_user)
    const [rows] = await connection.execute(
      'SELECT * FROM t_admin WHERE username = ? AND password = ?',
      [username, pass]
    );

    await connection.end();

    if (rows.length > 0) {
      // Login berhasil
      return res.status(200).json({
        success: true,
        admin: { username: rows[0].username }
      });
    } else {
      // Login gagal
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah!'
      });
    }

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server database.'
    });
  }
}