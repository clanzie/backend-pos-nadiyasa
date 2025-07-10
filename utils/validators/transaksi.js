const { body } = require("express-validator");

const validateTransaksi = [
  body("tunai")
    .notEmpty()
    .withMessage("Tunai tidak boleh kosong!")
    .isNumeric()
    .withMessage("Tunai harus berupa angka!"),
  body("diskon").isNumeric().withMessage("Diskon harus berupa angka!").isInt({ min: 0 }).withMessage("Diskon tidak boleh negatif!"),
  body("total_harga").notEmpty().withMessage("Total harga tidak boleh kosong!"),
];

module.exports = { validateTransaksi };
