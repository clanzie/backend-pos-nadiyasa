const { body } = require("express-validator");

const validateDetailPengadaan = [
  body("id_pengadaan")
    .notEmpty()
    .withMessage("ID pengadaan tidak boleh kosong!"),
  body("id_produk").notEmpty().withMessage("Produk tidak boleh kosong!"),
  body("harga_beli")
    .notEmpty()
    .withMessage("Harga beli tidak boleh kosong!")
    .isFloat({ min: 0 })
    .withMessage("Harga beli harus berupa angka positif!"),
  body("jumlah_produk")
    .notEmpty()
    .withMessage("Jumlah produk tidak boleh kosong!")
    .isInt({ min: 1 })
    .withMessage("Jumlah produk harus berupa angka positif!"),
];

module.exports = { validateDetailPengadaan };
