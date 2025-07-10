const { body } = require("express-validator");

const validateReturSupplier = [
  body("id_pengadaan")
    .notEmpty()
    .withMessage("ID pengadaan tidak boleh kosong!"),
  body("alasan").notEmpty().withMessage("Alasan retur tidak boleh kosong!"),
];

module.exports = { validateReturSupplier };
