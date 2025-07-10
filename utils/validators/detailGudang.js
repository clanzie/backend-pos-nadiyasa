const { body } = require("express-validator");

const validateDetailGudang = [
  body("id_produk").notEmpty().withMessage("ID produk tidak boleh kosong!"),
  body("id_gudang").notEmpty().withMessage("ID gudang tidak boleh kosong!"),
  body("stok_gudang")
    .notEmpty()
    .withMessage("Stok gudang tidak boleh kosong!")
    .isInt({ min: 0 })
    .withMessage("Stok gudang harus berupa angka bulat positif!"),
];

module.exports = { validateDetailGudang };
