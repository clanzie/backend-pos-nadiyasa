const { body } = require("express-validator");

const validateDetailReturCustomer = [
    body("id_retur_customer").notEmpty().withMessage("ID retur customer tidak boleh kosong!"),
    body("id_produk").notEmpty().withMessage("ID produk tidak boleh kosong!"),
    body("jumlah")
      .notEmpty().withMessage("Jumlah retur tidak boleh kosong!")
      .isInt({ min: 1 }).withMessage("Jumlah minimal 1!"),
  ];
  

module.exports = { validateDetailReturCustomer };
