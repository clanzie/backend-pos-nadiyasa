const express = require("express");
const router = express.Router();

// Validators and middlewares
const {
  validateLogin,
  validateUsers,
  validateKategori,
  validateProduk,
  validateGudang,
  validateCustomer,
  validateKeranjang,
  validateTransaksi,
  validatePenjualan,
  validateReturCustomer,
  validateProfit,
  validateSupplier,
  validateDetailPengadaan,
} = require("../utils/validators");
const {
  verifyToken,
  authorizeRole,
  handleValidationErrors,
  upload,
} = require("../middlewares");

// Controllers
const loginController = require("../controllers/LoginController");
const userController = require("../controllers/UserController");
const kategoriController = require("../controllers/KategoriController");
const produkController = require("../controllers/ProdukController");
const gudangController = require("../controllers/GudangController");
const detailGudangController = require("../controllers/DetailGudangController");
const customerController = require("../controllers/CustomerController");
const keranjangController = require("../controllers/KeranjangController");
const transaksiController = require("../controllers/TransaksiController");
const penjualanController = require("../controllers/PenjualanController");
const returCustomerController = require("../controllers/ReturCustomerController");
const profitController = require("../controllers/ProfitController");
const dashboardController = require("../controllers/DashboardController");
const supplierController = require("../controllers/SupplierController");
const pengadaanController = require("../controllers/PengadaanController");
const returSupplierController = require("../controllers/ReturSupplierController");
const stokAuditController = require("../controllers/StokAuditController");
const roleController = require("../controllers/RoleController");

const routes = [
  // Login route
  {
    method: "post",
    path: "/login",
    middlewares: [validateLogin, handleValidationErrors],
    handler: loginController.login,
  },

  {
    method: "get",
    path: "/roles",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: roleController.getAllRoles,
  },
  {
    method: "post",
    path: "/roles",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: roleController.createRole,
  },
  {
    method: "delete",
    path: "/roles/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: roleController.deleteRole,
  },

  // User routes
  {
    method: "get",
    path: "/users",
    middlewares: [verifyToken, authorizeRole(["owner"])],
    handler: userController.findUsers,
  },
  {
    method: "post",
    path: "/users",
    middlewares: [verifyToken, authorizeRole(["owner"]), validateUsers, handleValidationErrors],
    handler: userController.createUser,
  },
  {
    method: "get",
    path: "/users/:id",
    middlewares: [verifyToken, authorizeRole(["owner"])],
    handler: userController.findUserById,
  },
  {
    method: "put",
    path: "/users/:id",
    middlewares: [verifyToken, authorizeRole(["owner"]), validateUsers, handleValidationErrors],
    handler: userController.updateUser,
  },
  {
    method: "delete",
    path: "/users/:id",
    middlewares: [verifyToken, authorizeRole(["owner"])],
    handler: userController.deleteUser,
  },

  // Kategori routes
  {
    method: "get",
    path: "/kategori",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: kategoriController.findKategori,
  },
  {
    method: "post",
    path: "/kategori",
    middlewares: [
      verifyToken,
      upload.single("gambar_kategori"),
      validateKategori,
      handleValidationErrors,
      authorizeRole(["admin", "owner"]),
    ],
    handler: kategoriController.createKategori,
  },
  {
    method: "get",
    path: "/kategori/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: kategoriController.findKategoriById,
  },
  {
    method: "put",
    path: "/kategori/:id",
    middlewares: [
      verifyToken,
      upload.single("gambar_kategori"),
      validateKategori,
      handleValidationErrors,
      authorizeRole(["admin", "owner"])
    ],
    handler: kategoriController.updateKategori,
  },
  {
    method: "delete",
    path: "/kategori/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: kategoriController.deleteKategori,
  },
  {
    method: "get",
    path: "/kategori-all",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: kategoriController.getAllKategori,
  },

  // Produk routes
  {
    method: "get",
    path: "/produk",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: produkController.findProduk,
  },
  {
    method: "get",
    path: "/produk-kasir",
    middlewares: [verifyToken, authorizeRole(["owner", "kasir"])],
    handler: produkController.findProdukKasir,
  },
  {
    method: "post",
    path: "/produk",
    middlewares: [
      verifyToken,
      upload.single("gambar_produk"),
      validateProduk,
      handleValidationErrors,
      authorizeRole(["admin", "owner", "kasir"])
    ],
    handler: produkController.createProduk,
  },
  {
    method: "get",
    path: "/produk/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: produkController.findProdukById,
  },
  {
    method: "put",
    path: "/produk/:id",
    middlewares: [
      verifyToken,
      upload.single("gambar_produk"),
      validateProduk,
      handleValidationErrors,
      authorizeRole(["admin", "owner", "kasir"])
    ],
    handler: produkController.updateProduk,
  },
  {
    method: "delete",
    path: "/produk/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: produkController.deleteProduk,
  },
  {
    method: "get",
    path: "/produk-by-kategori/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: produkController.findProdukByKategori,
  },
  {
    method: "post",
    path: "/produk-by-barcode",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: produkController.findProdukByBarcode,
  },
  {
    method: "get",
    path: "/produk/:id_produk/gudang",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: produkController.findGudangProduk,
  },
  {
    method: "post",
    path: "/produk/:id_produk/tambah-stok",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: produkController.tambahStokProdukDariGudang,
  },

  // Gudang routes
  {
    method: "get",
    path: "/gudang",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: gudangController.findGudang,
  },

  {
    method: "post",
    path: "/gudang",
    middlewares: [verifyToken, validateGudang, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: gudangController.createGudang,
  },

  {
    method: "get",
    path: "/gudang/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: gudangController.findGudangById,
  },
  {
    method: "put",
    path: "/gudang/:id",
    middlewares: [verifyToken, validateGudang, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: gudangController.updateGudang,
  },
  {
    method: "delete",
    path: "/gudang/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: gudangController.deleteGudang,
  },
  {
    method: "post",
    path: "/gudang/pindah-stok",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: gudangController.pindahStokAntarGudang,
  },

  // Detail Gudang routes
  {
    method: "post",
    path: "/detail-gudang",
    middlewares: [verifyToken, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: detailGudangController.createDetailGudang,
  },
  {
    method: "get",
    path: "/detail-gudang/:id_produk/:id_gudang",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: detailGudangController.findDetailGudangById,
  },
  {
    method: "put",
    path: "/detail-gudang/:id_produk/:id_gudang",
    middlewares: [verifyToken, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: detailGudangController.updateDetailGudang,
  },
  {
    method: "delete",
    path: "/detail-gudang/:id_produk/:id_gudang",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: detailGudangController.deleteDetailGudang,
  },

  // Get all Produk di Gudang
  {
    method: "get",
    path: "/gudang/:id_gudang/detail-gudang",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: detailGudangController.findAllDetailGudangByGudang,
  },
  {
    method: "get",
    path: "/gudang/:id_gudang/all-produk/search",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: detailGudangController.findDetailProdukByProduk,
  },

  // Customer routes
  {
    method: "get",
    path: "/customer",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: customerController.findCustomers,
  },
  {
    method: "post",
    path: "/customer",
    middlewares: [verifyToken, validateCustomer, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: customerController.createCustomer,
  },
  {
    method: "get",
    path: "/customer/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: customerController.findCustomerById,
  },
  {
    method: "put",
    path: "/customer/:id",
    middlewares: [verifyToken, validateCustomer, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: customerController.updateCustomer,
  },
  {
    method: "delete",
    path: "/customer/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: customerController.deleteCustomer,
  },
  {
    method: "get",
    path: "/customer-all",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: customerController.allCustomer,
  },

  // Keranjang routes
  {
    method: "get",
    path: "/keranjang",
    middlewares: [verifyToken, authorizeRole(["kasir", "owner", "kasir"])],
    handler: keranjangController.findKeranjang,
  },
  {
    method: "post",
    path: "/keranjang",
    middlewares: [verifyToken, validateKeranjang, handleValidationErrors, authorizeRole(["kasir", "owner", "kasir"])],
    handler: keranjangController.createKeranjang,
  },
  {
    method: "delete",
    path: "/keranjang/:id",
    middlewares: [verifyToken, authorizeRole(["kasir", "owner"])],
    handler: keranjangController.deleteKeranjang,
  },

  // Transaksi routes
  {
    method: "post",
    path: "/transaksi",
    middlewares: [verifyToken, validateTransaksi, handleValidationErrors, authorizeRole(["kasir", "owner", "admin"])],
    handler: transaksiController.createTransaksi,
  },
  {
    method: "get",
    path: "/transaksi",
    middlewares: [verifyToken, authorizeRole(["kasir", "owner", "admin"])],
    handler: transaksiController.findTransaksiByInvoice,
  },
  {
    method: "get",
    path: "/transaksi/:id",
    middlewares: [verifyToken, authorizeRole(["kasir", "owner", "admin"])],
    handler: transaksiController.findTransaksiById,
  },
  {
    method: "get",
    path: "/daftar-transaksi",
    middlewares: [verifyToken, authorizeRole(["kasir", "owner", "admin"])],
    handler: transaksiController.findTransaksiByTanggal,
  },
  {
    method: "get",
    path: "/transaksi-all",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: transaksiController.findAllTransaksi,
  },
  {
    method: "get",
    path: "/transaksi/print",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: transaksiController.printNotaByInvoice,
  },

  // Penjualan routes
  {
    method: "get",
    path: "/penjualan",
    middlewares: [verifyToken, validatePenjualan, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: penjualanController.filterPenjualan,
  },
  {
    method: "get",
    path: "/penjualan/export",
    middlewares: [verifyToken, validatePenjualan, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: penjualanController.exportPenjualan,
  },

  // Retur Customer routes
  {
    method: "post",
    path: "/retur-customer",
    middlewares: [verifyToken, validateReturCustomer, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: returCustomerController.createReturCustomer,
  },
  {
    method: "get",
    path: "/retur-customer",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: returCustomerController.getAllReturCustomer,
  },
  {
    method: "get",
    path: "/retur-customer/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: returCustomerController.findReturCustomerById,
  },
  {
    method: "get",
    path: "/retur-customer/invoice/:invoice",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: returCustomerController.findReturCustomerByInvoice,
  },

  // Profit routes
  {
    method: "get",
    path: "/profit",
    middlewares: [verifyToken, validateProfit, handleValidationErrors, authorizeRole(["admin", "owner", "kasir"])],
    handler: profitController.filterProfit,
  },
  {
    method: "get",
    path: "/profit/export",
    middlewares: [verifyToken, validateProfit, handleValidationErrors, authorizeRole(["admin", "owner", "kasir"])],
    handler: profitController.exportProfit,
  },
  {
    method: "get",
    path: "/dashboard",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: dashboardController.getDashboardData,
  },

  // Supplier routes
  {
    method: "get",
    path: "/supplier",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: supplierController.findSupplier,
  },
  {
    method: "post",
    path: "/supplier",
    middlewares: [verifyToken, validateSupplier, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: supplierController.createSupplier,
  },
  {
    method: "get",
    path: "/supplier/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: supplierController.findSupplierById,
  },
  {
    method: "put",
    path: "/supplier/:id",
    middlewares: [verifyToken, validateSupplier, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: supplierController.updateSupplier,
  },
  {
    method: "delete",
    path: "/supplier/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: supplierController.deleteSupplier,
  },
  {
    method: "get",
    path: "/supplier-all",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: supplierController.getAllSupplier,
  },

  // Pengadaan routes
  {
    method: "post",
    path: "/pengadaan",
    middlewares: [verifyToken, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: pengadaanController.createPengadaan,
  },
  {
    method: "get",
    path: "/pengadaan-all",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: pengadaanController.getAllPengadaan,
  },
  {
    method: "get",
    path: "/pengadaan",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: pengadaanController.findPengadaan,
  },
  {
    method: "get",
    path: "/pengadaan/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: pengadaanController.findPengadaanById,
  },
  {
    method: "put",
    path: "/pengadaan/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: pengadaanController.updatePengadaan,
  },

  // Routes retur supplier
  {
    method: "post",
    path: "/retur-supplier",
    middlewares: [verifyToken, handleValidationErrors, authorizeRole(["admin", "owner"])],
    handler: returSupplierController.createReturSupplier,
  },
  {
    method: "get",
    path: "/retur-supplier",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: returSupplierController.findReturSupplier,
  },
  {
    method: "get",
    path: "/retur-supplier/:id",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: returSupplierController.findReturSupplierById,
  },
  {
    method: "get",
    path: "/harga-beli/:id_pengadaan/:id_produk",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: returSupplierController.findHargaBeliPengadaan,
  },
  {
    method: "get",
    path: "/retur-supplier/pengadaan/:id_pengadaan",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: returSupplierController.findReturSupplierByPengadaanId,
  },

  // Routes  Stok Audit
  {
    method: "get",
    path: "/stok-audit",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: stokAuditController.filterStokAudit,
  },

  {
    method: "get",
    path: "/harga/:id_produk/:id_transaksi",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: returCustomerController.findHarga,
  },

  //Laporan
  {
    method: "get",
    path: "/laporan-stok-produk",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: produkController.laporanStokProdukGabungan,
  },

  {
    method: "get",
    path: "/laporan-stok-produk/export",
    middlewares: [verifyToken, authorizeRole(["admin", "owner", "kasir"])],
    handler: produkController.exportLaporanStokProdukGabungan,
  },
  {
    method: "get",
    path: "/laporan-pengadaan",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: pengadaanController.laporanPengadaan,
  },
  {
    method: "get",
    path: "/laporan-retur-customer",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: returCustomerController.laporanReturCustomer,
  },
  {
    method: "get",
    path: "/laporan-retur-supplier",
    middlewares: [verifyToken, authorizeRole(["admin", "owner"])],
    handler: returSupplierController.laporanReturSupplier,
  },

];

// Helper function to create routes
const createRoutes = (routes) => {
  routes.forEach(({ method, path, middlewares, handler }) => {
    router[method](path, ...middlewares, handler);
  });
};

createRoutes(routes);

module.exports = router;
