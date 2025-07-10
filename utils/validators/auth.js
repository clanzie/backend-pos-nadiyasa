const { body } = require("express-validator");
const prisma = require("../../prisma/client");

const validateLogin = [
  body("username")
    .notEmpty()
    .withMessage("Username is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

module.exports = { validateLogin };
