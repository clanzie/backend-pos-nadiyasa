const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

const storage = multer.diskStorage({
  // Menentukan direktori tujuan upload
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Mengarahkan file yang diupload ke folder 'uploads/'
  },
  // Menentukan nama file yang disimpan
  filename: (req, file, cb) => {
    // Menghasilkan hash unik untuk nama file
    const fileHash = crypto.randomBytes(16).toString("hex");
    // Mengambil ekstensi file dari nama file asli
    const ext = path.extname(file.originalname).toLowerCase();
    // Menyusun nama file baru dengan hash dan ekstensi
    cb(null, `${fileHash}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Mengambil ekstensi file dari nama file asli
  const ext = path.extname(file.originalname).toLowerCase();
  // Memeriksa apakah ekstensi file termasuk dalam daftar ekstensi yang diizinkan
  if (allowedExtensions.includes(ext)) {
    cb(null, true); // Jika ekstensi diizinkan, lanjutkan dengan upload
  } else {
    // Jika ekstensi tidak diizinkan, batalkan upload dan kirimkan error
    cb(new Error("Ekstensi gambar tidak valid"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter, // Menggunakan filter file yang telah ditentukan
  limits: { fileSize: 5 * 1024 * 1024 }, // Membatasi ukuran file maksimum hingga 5 MB
});

module.exports = upload;
