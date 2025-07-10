const { body } = require("express-validator");

const validateGudang = [
  body("nama_gudang").notEmpty().withMessage("Nama Gudang tidak boleh kosong!"),
  body("alamat_gudang")
    .notEmpty()
    .withMessage("Alamat Gudang tidak boleh kosong!"),
];

module.exports = { validateGudang };
