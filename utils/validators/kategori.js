const { body, check } = require('express-validator');

const validateKategori = [
  body('nama_kategori')
    .notEmpty().withMessage('Nama kategori tidak boleh kosong!'),

  check('gambar_kategori')
    .optional()
    .custom((value, { req }) => {
     
      if (req.method === 'POST' && !req.file) {
       
        throw new Error('Gambar kategori tidak boleh kosong!');
      }

      return true;
    }),
];

module.exports = { validateKategori };