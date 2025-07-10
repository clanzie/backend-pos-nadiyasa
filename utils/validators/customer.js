const { body } = require("express-validator");

const validateCustomer = [
  body("nama_customer")
    .notEmpty()
    .withMessage("Nama customer tidak boleh kosong!"),
  body("alamat_customer")
    .notEmpty()
    .withMessage("Alamat customer tidak boleh kosong!"),
  body("no_telp_customer")
    .notEmpty()
    .withMessage("Nomor telepon customer tidak boleh kosong!"),
];

module.exports = { validateCustomer };
