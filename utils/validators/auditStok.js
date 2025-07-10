const { body } = require("express-validator");

const validateAuditStok = [
  body("id_produk").notEmpty().withMessage("ID produk tidak boleh kosong!"),
  body("jenis").notEmpty().withMessage("Jenis aktivitas tidak boleh kosong!"),
  body("jumlah")
    .notEmpty()
    .withMessage("Jumlah tidak boleh kosong!")
    .isInt()
    .withMessage("Jumlah harus berupa angka!"),
];

module.exports = { validateAuditStok };
