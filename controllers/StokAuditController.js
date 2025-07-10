const express = require("express");
const prisma = require("../prisma/client");
const { moneyFormat } = require("../utils/moneyFormat");
const ExcelJS = require("exceljs");

const filterStokAudit = async (req, res) => {
  try {
    const startDate = new Date(req.query.start_date);
    const endDate = new Date(req.query.end_date);
    endDate.setHours(23, 59, 59, 999);

    const { id_produk, nama_produk } = req.query;

    const stokAudit = await prisma.auditStok.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
        ...(id_produk && {
          id_produk: Number(id_produk),
        }),
        ...(nama_produk && {
          produk: {
            nama_produk: {
              contains: nama_produk,
              mode: "insensitive",
            },
          },
        }),
      },
      include: {
        produk: {
          select: {
            id_produk: true,
            nama_produk: true,
            barcode_produk: true,
            satuan: true,
          },
        },
        gudang: {
          select: {
            id_gudang: true,
            nama_gudang: true,
          },
        },
        transaksi: {
          select: {
            id_transaksi: true,
            invoice: true,
          },
        },
        pengadaan: {
          select: {
            id_pengadaan: true,
          },
        },
        retur_customer: {
          select: {
            id_retur_customer: true,
          },
        },
        retur_supplier: {
          select: {
            id_retur_supplier: true,
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    const totalJumlah = await prisma.auditStok.aggregate({
      _sum: {
        jumlah: true,
      },
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
        ...(id_produk && {
          id_produk: Number(id_produk),
        }),
        ...(nama_produk && {
          produk: {
            nama_produk: {
              contains: nama_produk,
              mode: "insensitive",
            },
          },
        }),
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan stok audit dari ${req.query.start_date} hingga ${req.query.end_date}`,
      },
      data: {
        stok_audit: stokAudit,
        total_jumlah: totalJumlah._sum.jumlah || 0,
      },
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      errors: error,
    });
  }
};

module.exports = { filterStokAudit };