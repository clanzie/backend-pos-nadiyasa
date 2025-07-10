const { validateLogin } = require("./auth");
const { validateUsers } = require("./users");
const { validateKategori } = require("./kategori");
const { validateProduk } = require("./produk");
const { validateCustomer } = require("./customer");
const { validateKeranjang } = require("./keranjang");
const { validateTransaksi } = require("./transaksi");
const { validatePenjualan } = require("./penjualan");
const { validateProfit } = require("./profit");
const { validateDetailPengadaan } = require("./detailPengadaan");
const { validateGudang } = require("./gudang");
const { validateSupplier } = require("./supplier");
const { validateDetailGudang } = require("./detailGudang");
const { validateReturCustomer } = require("./returCustomer");
const { validateDetailReturCustomer } = require("./detailReturCustomer");

module.exports = {
  validateLogin,
  validateUsers,
  validateKategori,
  validateProduk,
  validateCustomer,
  validateKeranjang,
  validateTransaksi,
  validatePenjualan,
  validateProfit,
  validateDetailPengadaan,
  validateGudang,
  validateSupplier,
  validateDetailGudang,
  validateReturCustomer,
  validateDetailReturCustomer,
};
