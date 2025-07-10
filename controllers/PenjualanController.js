const express = require("express");
const prisma = require("../prisma/client");
const excelJS = require("exceljs");

const { moneyFormat } = require("../utils/moneyFormat");

const filterPenjualan = async (req, res) => {
  try {
    const startDate = new Date(req.query.start_date);
    const endDate = new Date(req.query.end_date);
    endDate.setHours(23, 59, 59, 999);

    const penjualan = await prisma.transaksi.findMany({
      where: {
        tanggal_transaksi: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        customer: {
          select: {
            id_customer: true,
            nama_customer: true,
          },
        },
      },
    });

    const total = await prisma.transaksi.aggregate({
      _sum: {
        total_harga: true,
      },
      where: {
        tanggal_transaksi: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan semua penjualan dari ${req.query.start_date} hingga ${req.query.end_date} berhasil diambil`,
      },
      data: {
        penjualan: penjualan,
        total_penjualan: total._sum.total_harga || 0,
      },
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

const exportPenjualan = async (req, res) => {
  try {
    const startDate = new Date(req.query.start_date);
    const endDate = new Date(req.query.end_date);
    endDate.setHours(23, 59, 59, 999);

    const penjualan = await prisma.transaksi.findMany({
      where: {
        tanggal_transaksi: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        customer: {
          select: {
            id_customer: true,
            nama_customer: true,
          },
        },
      },
    });

    const total = await prisma.transaksi.aggregate({
      _sum: {
        total_harga: true,
      },
      where: {
        tanggal_transaksi: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Penjualan");

    worksheet.columns = [
      { header: "TANGGAL", key: "tanggal_transaksi", width: 25 },
      { header: "INVOICE", key: "invoice", width: 30 },
      { header: "KASIR", key: "user", width: 15 },
      { header: "CUSTOMER", key: "customer", width: 15 },
      { header: "PAYMENT METHOD", key: "metode_transaksi", width: 30 },
      { header: "TOTAL", key: "total_harga", width: 30 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    worksheet.columns.forEach((col) => {
      col.style = {
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };
    });

    penjualan.forEach((item) => {
      worksheet.addRow({
        tanggal_transaksi: item.tanggal_transaksi,
        invoice: item.invoice,
        user: item.user.username,
        customer: item.customer?.nama_customer || "Umum",
        metode_transaksi: item.metode_transaksi,
        total_harga: `${moneyFormat(item.total_harga)}`,
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.getCell("tanggal_transaksi").alignment = { horizontal: "left" };
      row.getCell("invoice").alignment = { horizontal: "left" };
      row.getCell("user").alignment = { horizontal: "left" };
      row.getCell("customer").alignment = { horizontal: "left" };
      row.getCell("metode_transaksi").alignment = { horizontal: "left" };
      row.getCell("total_harga").alignment = { horizontal: "right" };
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    const totalRow = worksheet.addRow({
      tanggal_transaksi: "",
      invoice: "",
      user: "",
      customer: "",
      metode_transaksi: "TOTAL",
      total_harga: `${moneyFormat(total._sum.total_harga)}`,
    });

    totalRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "right" };
      if (colNumber === 5) {
        cell.alignment = { horizontal: "right" };
      }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    workbook.xlsx.write(res);
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

module.exports = {
  filterPenjualan,
  exportPenjualan,
};
