const { body } = require("express-validator");

const prisma = require("../../prisma/client");

const validateUsers = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .custom(async (value, { req }) => {
      if (!value) {
        throw new Error("Username is required");
      }

      let where = { username: value };
      if (req.method === "PUT" && req.params.id) {
        where = {
          username: value,
          id: { not: Number(req.params.id) },
        };
      }

      const user = await prisma.users.findFirst({ where });
      if (user) {
        throw new Error("Username already exists");
      }
      return true;
    }),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid")
    .custom(async (value, { req }) => {
      if (!value) {
        throw new Error("Email is required");
      }

      const users = await prisma.users.findFirst({
        where: {
          email: value,
          NOT: {
            id: Number(req.params.id) || undefined,
          },
        },
      });

      if (users) {
        throw new Error("Email already exists");
      }
      return true;
    }),

  body("password")
    .if((value, { req }) => req.method === "POST")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("password")
    .if((value, { req }) => req.method === "PUT")
    .optional(),
];

module.exports = { validateUsers };
