const { body } = require("express-validator");

const validateDetailReturSupplier = [
  body("id_retur_supplier")
    .notEmpty()
    .withMessage("ID retur supplier tidak boleh kosong!"),
  body("id_produk").notEmpty().withMessage("ID produk tidak boleh kosong!"),
  body("jumlah")
    .notEmpty()
    .withMessage("Jumlah tidak boleh kosong!")
    .isInt({ min: 1 })
    .withMessage("Jumlah minimal 1!"),
];

module.exports = { validateDetailReturSupplier };
