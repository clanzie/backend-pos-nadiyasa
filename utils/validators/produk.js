const { body, check } = require("express-validator");
const prisma = require("../../prisma/client");

const validateProduk = [
  body("id_kategori").notEmpty().withMessage("ID Kategori tidak boleh kosong!"),
  body("nama_produk").notEmpty().withMessage("Nama produk tidak boleh kosong!"),
  check("gambar_produk").custom((value, { req }) => {
    if (req.method === "POST" && !req.file) {
      throw new Error("Gambar produk tidak boleh kosong!");
    }
    return true;
  }),
  body("barcode_produk")
    .custom(async (barcode_produk, { req }) => {
      const existingProduk = await prisma.produk.findFirst({
        where: { barcode_produk },
      });

      if (
        existingProduk &&
        (!req.params.id || existingProduk.id_produk !== parseInt(req.params.id))
      ) {
        throw new Error("Barcode produk sudah terdaftar!");
      }

      return true;
    }),

  body("harga_beli")
    .notEmpty()
    .withMessage("Harga beli tidak boleh kosong!")
    .isNumeric()
    .withMessage("Harga beli harus berupa angka!")
    .isFloat({ min: 0 })
    .withMessage("Harga beli harus berupa angka positif!"),
  body("harga_jual")
    .notEmpty()
    .withMessage("Harga jual tidak boleh kosong!")
    .isNumeric()
    .withMessage("Harga jual harus berupa angka!")
    .isFloat({ min: 0 })
    .withMessage("Harga jual harus berupa angka positif!"),
];

module.exports = { validateProduk };
