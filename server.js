const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint login lokal
app.post('/api/login', async (req, res) => {
    const { username, pass } = req.body;
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 4000,
            ssl: { rejectUnauthorized: true }
        });

        // Contoh cek ke tabel admin / t_user
        const [rows] = await connection.execute(
            'SELECT * FROM t_user WHERE id_user = ? AND fullname = ?', 
            [username, pass]
        );
        await connection.end();

        if (rows.length > 0) {
            res.json({ success: true, admin: rows[0] });
        } else {
            res.json({ success: false, message: 'Username atau password salah!' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal konek database: ' + err.message });
    }
});

app.listen(3000, () => console.log('Server lokal jalan di http://localhost:3000'));