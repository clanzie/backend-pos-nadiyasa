const express = require("express");
const prisma = require("../prisma/client");
const ExcelJS = require("exceljs");

const fs = require("fs");

const findProduk = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const produk = await prisma.produk.findMany({
      where: {
        nama_produk: {
          contains: search,
        },
      },
      select: {
        id_produk: true,
        nama_produk: true,
        gambar_produk: true,
        barcode_produk: true,
        satuan: true,
        stok_produk: true,
        harga_beli: true,
        harga_jual: true,
        created_at: true,
        updated_at: true,
        kategori: {
          select: {
            nama_kategori: true,
          },
        },
      },
      orderBy: {
        id_produk: "desc",
      },
      skip: skip,
      take: limit,
    });


    const totalProduk = await prisma.produk.count({
      where: {
        nama_produk: {
          contains: search,
        },
      },
    });

    const totalPages = Math.ceil(totalProduk / limit);

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua produk",
      },
      data: produk,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalProduk,
      },
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
};

const findProdukKasir = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const produk = await prisma.produk.findMany({
      where: {
        nama_produk: {
          contains: search,
        },
      },
      select: {
        id_produk: true,
        nama_produk: true,
        gambar_produk: true,
        barcode_produk: true,
        satuan: true,
        stok_produk: true,
        harga_beli: true,
        harga_jual: true,
        created_at: true,
        updated_at: true,
        kategori: {
          select: {
            nama_kategori: true,
          },
        },
      },
      orderBy: {
        stok_produk: "desc",
      },
      skip: skip,
      take: limit,
    });


    const totalProduk = await prisma.produk.count({
      where: {
        nama_produk: {
          contains: search,
        },
      },
    });

    const totalPages = Math.ceil(totalProduk / limit);

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua produk",
      },
      data: produk,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalProduk,
      },
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
};


async function generateBarcode(id_kategori) {
  const kategoriStr = id_kategori.toString().padStart(2, '0');
  const count = await prisma.produk.count({
    where: { id_kategori: id_kategori }
  });
  const urutProduk = (count + 1).toString().padStart(2, '0');
  return `${kategoriStr}${urutProduk}`;
}

const createProduk = async (req, res) => {
  try {
    const id_kategori = parseInt(req.body.id_kategori);

    let barcode_produk = req.body.barcode_produk;
    if (!barcode_produk) {
      barcode_produk = await generateBarcode(id_kategori);
    }

    const produk = await prisma.produk.create({
      data: {
        nama_produk: req.body.nama_produk,
        barcode_produk: barcode_produk,
        satuan: req.body.satuan,
        stok_produk: parseInt(req.body.stok_produk),
        harga_beli: parseInt(req.body.harga_beli),
        harga_jual: parseInt(req.body.harga_jual),
        gambar_produk: req.file.path,
        id_kategori: id_kategori,
      },
      include: {
        kategori: true,
      },
    });

    res.status(201).send({
      meta: {
        success: true,
        message: "Berhasil menambahkan produk",
      },
      data: produk,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
};

const findProdukById = async (req, res) => {
  const { id } = req.params;
  try {
    const produk = await prisma.produk.findUnique({
      where: {
        id_produk: parseInt(id),
      },
      select: {
        id_produk: true,
        id_kategori: true,
        nama_produk: true,
        gambar_produk: true,
        barcode_produk: true,
        satuan: true,
        stok_produk: true,
        harga_beli: true,
        harga_jual: true,
        updated_at: true,
        created_at: true,
        kategori: {
          select: {
            nama_kategori: true,
            gambar_kategori: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    if (!produk) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Produk dengan id ${id} tidak ditemukan`,
        },
      });
    }

    res.status(200).send({
      meta: {
        status: true,
        message: `Berhasil mendapatkan produk dengan id ${id}`,
      },
      data: produk,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
};

const updateProduk = async (req, res) => {
  const { id } = req.params;

  try {
    const dataProduk = {
      nama_produk: req.body.nama_produk,
      barcode_produk: req.body.barcode_produk,
      satuan: req.body.satuan,
      stok_produk: parseInt(req.body.stok_produk),
      harga_beli: parseInt(req.body.harga_beli),
      harga_jual: parseInt(req.body.harga_jual),
      id_kategori: parseInt(req.body.id_kategori),
      updated_at: new Date(),
    };

    if (req.file) {
      dataProduk.gambar_produk = req.file.path;

      const produk = await prisma.produk.findUnique({
        where: {
          id_produk: Number(id),
        },
      });

      if (produk.gambar_produk) {
        fs.unlinkSync(produk.gambar_produk);
      }
    }

    const produk = await prisma.produk.update({
      where: {
        id_produk: Number(id),
      },
      data: dataProduk,
      include: {
        kategori: true,
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mengupdate produk",
      },
      data: produk,
    });
  } catch (error) {
    console.log(error.message);
    console;
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
};

const deleteProduk = async (req, res) => {
  const { id } = req.params;

  try {
    const produk = await prisma.produk.findUnique({
      where: {
        id_produk: Number(id),
      },
    });

    if (!produk) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Produk dengan id ${id} tidak ditemukan`,
        },
      });
    }

    await prisma.produk.delete({
      where: {
        id_produk: Number(id),
      },
    });

    if (produk.gambar_produk) {
      const imagePath = produk.gambar_produk;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Menghapus file gambar produk
      }
    }

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil menghapus produk",
      },
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
};

const findProdukByKategori = async (req, res) => {
  const { id } = req.params;

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const produk = await prisma.produk.findMany({
      where: {
        id_kategori: Number(id),
      },
      select: {
        id_produk: true,
        id_kategori: true,
        nama_produk: true,
        gambar_produk: true,
        barcode_produk: true,
        satuan: true,
        stok_produk: true,
        harga_beli: true,
        harga_jual: true,
        created_at: true,
        updated_at: true,
      },
      skip: skip,
      take: limit,
    });

    const totalProduk = await prisma.produk.count({
      where: {
        id_kategori: Number(id),
      },
    });

    const totalPages = Math.ceil(totalProduk / limit); // Total halaman

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan produk berdasarkan kategori ID: ${id}`,
      },
      data: produk,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalProduk,
      },
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
};

const findProdukByBarcode = async (req, res) => {
  try {
    const produk = await prisma.produk.findMany({
      where: {
        barcode_produk: req.body.barcode_produk,
      },
      select: {
        id_produk: true,
        id_kategori: true,
        nama_produk: true,
        gambar_produk: true,
        barcode_produk: true,
        satuan: true,
        stok_produk: true,
        harga_beli: true,
        harga_jual: true,
        created_at: true,
        updated_at: true,
        kategori: {
          select: {
            nama_kategori: true,
            gambar_kategori: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    if (!produk) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Produk dengan barcode ${req.body.barcode_produk} tidak ditemukan`,
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan produk dengan barcode ${req.body.barcode_produk}`,
      },
      data: produk,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
};


const findGudangProduk = async (req, res) => {
  const { id_produk } = req.params;
  try {
    const gudang = await prisma.detailGudang.findMany({
      where: { id_produk: parseInt(id_produk) },
      select: {
        stok_gudang: true,
        gudang: {
          select: {
            id_gudang: true,
            nama_gudang: true,
            alamat_gudang: true,
          },
        },
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: `Daftar gudang yang menyimpan produk ID ${id_produk}`,
      },
      data: gudang,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
};

const tambahStokProdukDariGudang = async (req, res) => {
  const { id_produk } = req.params;
  const { id_gudang, jumlah } = req.body;

  try {
    const detailGudang = await prisma.detailGudang.findFirst({
      where: {
        id_produk: parseInt(id_produk),
        id_gudang: parseInt(id_gudang),
      },
    });

    if (!detailGudang || detailGudang.stok_gudang < jumlah) {
      return res.status(400).send({
        meta: {
          success: false,
          message: "Stok di gudang tidak mencukupi",
        },
      });
    }

    await prisma.detailGudang.update({
      where: {
        id_produk_id_gudang: {
          id_produk: parseInt(id_produk),
          id_gudang: parseInt(id_gudang),
        },
      },
      data: {
        stok_gudang: {
          decrement: parseInt(jumlah),
        },
      },
    });

    const produk = await prisma.produk.update({
      where: {
        id_produk: parseInt(id_produk),
      },
      data: {
        stok_produk: {
          increment: parseInt(jumlah),
        },
      },
    });

    await prisma.auditStok.create({
      data: {
        id_produk: parseInt(id_produk),
        id_gudang: parseInt(id_gudang),
        jenis: "Transfer",
        jumlah: parseInt(jumlah),
        keterangan: `Transfer stok dari gudang ${id_gudang} ke toko`,
        tanggal: new Date(),
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil menambahkan stok dari gudang ke produk",
      },
      data: produk,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
};

const laporanStokProdukGabungan = async (req, res) => {
  try {
    const produk = await prisma.produk.findMany({
      select: {
        id_produk: true,
        nama_produk: true,
        stok_produk: true,
        satuan: true,
        kategori: { select: { nama_kategori: true } },
        detail_gudang: {
          select: {
            id_gudang: true,
            stok_gudang: true,
            gudang: { select: { nama_gudang: true } }
          }
        }
      },
      orderBy: { nama_produk: "asc" }
    });

    const data = produk.map((item) => ({
      id_produk: item.id_produk,
      nama_produk: item.nama_produk,
      kategori: item.kategori?.nama_kategori || "",
      satuan: item.satuan,
      stok_toko: item.stok_produk,
      stok_gudang: item.detail_gudang.map(g => ({
        id_gudang: g.id_gudang,
        nama_gudang: g.gudang?.nama_gudang || "",
        stok_gudang: g.stok_gudang
      }))
    }));

    res.status(200).send({
      meta: { success: true, message: "Laporan stok produk (toko & gudang)" },
      data,
    });
  } catch (error) {
    res.status(500).send({
      meta: { success: false, message: "Terjadi kesalahan pada server" },
      data: error,
    });
  }
};

const exportLaporanStokProdukGabungan = async (req, res) => {
  try {
    const produk = await prisma.produk.findMany({
      select: {
        id_produk: true,
        nama_produk: true,
        stok_produk: true,
        satuan: true,
        kategori: { select: { nama_kategori: true } },
        detail_gudang: {
          select: {
            id_gudang: true,
            stok_gudang: true,
            gudang: { select: { nama_gudang: true } }
          }
        }
      },
      orderBy: { nama_produk: "asc" }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Stok Produk");

    const today = new Date();
    const tanggalCetak = today.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    worksheet.addRow([`Tanggal Cetak: ${tanggalCetak}`]);
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').font = { bold: true };
    worksheet.getCell('A1').alignment = { horizontal: "left" };

    worksheet.addRow([
      "ID PRODUK", "NAMA PRODUK", "KATEGORI", "SATUAN", "STOK TOKO", "NAMA GUDANG", "STOK GUDANG"
    ]);
    worksheet.getRow(2).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    produk.forEach((item) => {
      if (item.detail_gudang.length > 0) {
        item.detail_gudang.forEach((gudang) => {
          worksheet.addRow([
            item.id_produk,
            item.nama_produk,
            item.kategori?.nama_kategori || "-",
            item.satuan || "-",
            item.stok_produk != null ? item.stok_produk : "-",
            gudang.gudang?.nama_gudang || "-",
            gudang.stok_gudang != null ? gudang.stok_gudang : "-",
          ]);
        });
      } else {
        worksheet.addRow([
          item.id_produk,
          item.nama_produk,
          item.kategori?.nama_kategori || "-",
          item.satuan || "-",
          item.stok_produk != null ? item.stok_produk : "-",
          "-",
          "-",
        ]);
      }
    });

    worksheet.columns = [
      { width: 12 },
      { width: 30 },
      { width: 20 },
      { width: 12 },
      { width: 12 },
      { width: 20 },
      { width: 12 },
    ];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 2) return;
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "left" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan_stok_produk.xlsx`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).send({
      meta: { success: false, message: "Terjadi kesalahan pada server" },
      data: error,
    });
  }
};

module.exports = {
  findProduk,
  findProdukKasir,
  createProduk,
  findProdukById,
  updateProduk,
  deleteProduk,
  findProdukByKategori,
  findProdukByBarcode,
  findGudangProduk,
  tambahStokProdukDariGudang,
  laporanStokProdukGabungan,
  exportLaporanStokProdukGabungan,
};
