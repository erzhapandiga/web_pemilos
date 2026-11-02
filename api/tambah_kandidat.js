const connectDB = require('./koneksi');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

// Konfigurasi Vercel agar body parser dimatikan untuk form-data upload file
const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Metode tidak diizinkan' });
  }

  const form = new formidable.IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Gagal memproses form upload.' });
    }

    const getVal = (val) => Array.isArray(val) ? val[0] : val;

    const nama = getVal(fields.nama);
    const detail_data = getVal(fields.detail_data);
    const visi = getVal(fields.visi);
    const misi = getVal(fields.misi);
    const program = getVal(fields.program);
    const no_k = getVal(fields.no_k);
    
    const fotoFile = files.foto ? (Array.isArray(files.foto) ? files.foto[0] : files.foto) : null;

    if (!nama || !detail_data || !visi || !misi || !no_k || !fotoFile) {
      return res.status(400).json({ success: false, message: 'Semua form dan foto wajib diisi!' });
    }

    const thn = new Date().getFullYear();
    const dpn = thn + 1;
    const periode = `${thn}/${dpn}`;

    try {
      const uploadDir = path.join(process.cwd(), 'public', 'assets', 'img', 'kandidat');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = path.extname(fotoFile.originalFilename || '.jpg');
      const newName = Date.now() + fileExtension;
      const newPath = path.join(uploadDir, newName);

      fs.copyFileSync(fotoFile.filepath, newPath);

      const db = await connectDB();
      const query = `INSERT INTO t_kandidat(nama_calon, foto, detail_data, visi, misi, periode, program, no_k) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
      
      await db.execute(query, [nama, newName, detail_data, visi, misi, periode, program, no_k]);

      return res.status(200).json({ success: true, message: 'Kandidat Berhasil ditambahkan!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Database error: ' + error.message });
    }
  });
}

module.exports = handler;
module.exports.config = config;