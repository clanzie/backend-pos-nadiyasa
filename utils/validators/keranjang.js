const { body } = require("express-validator");

const validateKeranjang = [
  body("id_produk").notEmpty().withMessage("Produk tidak boleh kosong!"),
  body("jumlah").notEmpty().withMessage("Jumlah tidak boleh kosong!"),
];

module.exports = { validateKeranjang };
