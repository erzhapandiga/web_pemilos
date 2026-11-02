const connectDB = require('./koneksi.js');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Metode tidak diizinkan' });
  }

  try {
    const db = await connectDB();
    const [rows] = await db.execute('SELECT * FROM t_kandidat ORDER BY no_k ASC');

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database error: ' + error.message });
  }
}

module.exports = handler;