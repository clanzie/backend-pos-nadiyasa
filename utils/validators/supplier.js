const { body } = require("express-validator");

const validateSupplier = [
  body("nama_supplier")
    .notEmpty()
    .withMessage("Nama supplier tidak boleh kosong!"),
  body("alamat_supplier")
    .notEmpty()
    .withMessage("Alamat supplier tidak boleh kosong!"),
  body("no_telp_supplier")
    .notEmpty()
    .withMessage("Nomor telepon supplier tidak boleh kosong!"),
];

module.exports = { validateSupplier };
