const connectDB = require('./koneksi.js');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

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
      return res.status(500).json({ success: false, message: 'Gagal memproses form edit.' });
    }

    const getVal = (val) => Array.isArray(val) ? val[0] : val;

    const id = getVal(fields.id);
    const nama = getVal(fields.nama);
    const visi = getVal(fields.visi);
    const misi = getVal(fields.misi);
    const program = getVal(fields.program);
    const no_k = getVal(fields.no_k);
    const detail = getVal(fields.detail_data);
    const fotoLama = getVal(fields.f);

    if (!id || !nama || !visi || !misi || !program || !detail) {
      return res.status(400).json({ success: false, message: 'Semua form wajib terisi!' });
    }

    try {
      const db = await connectDB();
      const fotoFile = files.foto ? (Array.isArray(files.foto) ? files.foto[0] : files.foto) : null;

      // Cek apakah user mengunggah foto baru
      if (fotoFile && fotoFile.size > 0 && fotoFile.originalFilename) {
        const uploadDir = path.join(process.cwd(), 'public', 'assets', 'img', 'kandidat');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileExtension = path.extname(fotoFile.originalFilename || '.jpg');
        const newName = Date.now() + fileExtension;
        const newPath = path.join(uploadDir, newName);

        // Salin file baru
        fs.copyFileSync(fotoFile.filepath, newPath);

        // Hapus foto lama jika ada
        if (fotoLama) {
          const oldPath = path.join(uploadDir, fotoLama);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        // Query Update dengan Foto Baru
        const query = `UPDATE t_kandidat SET nama_calon = ?, foto = ?, visi = ?, misi = ?, program = ?, no_k = ?, detail_data = ? WHERE id_kandidat = ?`;
        await db.execute(query, [nama, newName, visi, misi, program, no_k, detail, id]);

      } else {
        // Query Update tanpa Ganti Foto
        const query = `UPDATE t_kandidat SET nama_calon = ?, visi = ?, misi = ?, program = ?, no_k = ?, detail_data = ? WHERE id_kandidat = ?`;
        await db.execute(query, [nama, visi, misi, program, no_k, detail, id]);
      }

      return res.status(200).json({ success: true, message: 'Kandidat Berhasil diperbarui!' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Database error: ' + error.message });
    }
  });
}

module.exports = handler;
module.exports.config = config;