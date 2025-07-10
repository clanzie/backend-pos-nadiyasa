const { body } = require("express-validator");

const validateReturCustomer = [
  
  body("invoice").notEmpty().withMessage("Invoice tidak boleh kosong!"),
];

module.exports = { validateReturCustomer };