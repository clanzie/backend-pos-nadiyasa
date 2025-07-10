const express = require("express");
const prisma = require("../prisma/client");
const { moneyFormat } = require("../utils/moneyFormat");
const ExcelJS = require("exceljs");

const filterProfit = async (req, res) => {
  try {
    const startDate = new Date(req.query.start_date);
    const endDate = new Date(req.query.end_date);
    endDate.setHours(23, 59, 59, 999);

    const profit = await prisma.profit.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        transaksi: {
          select: {
            id_transaksi: true,
            invoice: true,
            total_harga: true,
            tanggal_transaksi: true,
            detail_transaksi: {
              select: {
                produk: {
                  select: {
                    nama_produk: true,
                    barcode_produk: true,
                  }
                }
              }
            }
          },
        },
      },
    });

    const total = await prisma.profit.aggregate({
      _sum: { nominal: true },
      where: {
        created_at: { gte: startDate, lte: endDate },
      },
    });

    res.status(200).send({
      meta: { success: true, message: `Berhasil mendapatkan semua profit dari ${req.query.start_date} hingga ${req.query.end_date} berhasil diambil` },
      data: {
        profit: profit,
        total_profit: total._sum.nominal || 0,
      },
    });
  } catch (error) {
    res.status(500).send({
      meta: { success: false, message: "Terjadi kesalahan pada server" },
      errors: error,
    });
  }
};

const exportProfit = async (req, res) => {
  try {
    const startDate = new Date(req.query.start_date);
    const endDate = new Date(req.query.end_date);
    endDate.setHours(23, 59, 59, 999);

    const profit = await prisma.profit.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        transaksi: {
          select: {
            id_transaksi: true,
            invoice: true,
            total_harga: true,
            tanggal_transaksi: true,
            detail_transaksi: {
              select: {
                produk: {
                  select: {
                    nama_produk: true,
                    barcode_produk: true,
                  }
                }
              }
            }
          },
        },
      },
    });

    const total = await prisma.profit.aggregate({
      _sum: {
        nominal: true,
      },
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Profit Report");

    worksheet.columns = [
      { header: "TANGGAL", key: "created_at", width: 20 },
      { header: "INVOICE", key: "invoice", width: 40 },
      { header: "PRODUK", key: "produk", width: 40 },
      { header: "BARCODE", key: "barcode", width: 30 },
      { header: "NOMINAL", key: "nominal", width: 40 },
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

    profit.forEach((item) => {
      if (
        item.transaksi &&
        item.transaksi.detail_transaksi &&
        item.transaksi.detail_transaksi.length > 0
      ) {
        item.transaksi.detail_transaksi.forEach((detail) => {
          worksheet.addRow({
            created_at: item.created_at,
            invoice: item.transaksi.invoice,
            produk: detail.produk.nama_produk,
            barcode: detail.produk.barcode_produk,
            nominal: moneyFormat(item.nominal),
          });
        });
      } else {
        worksheet.addRow({
          created_at: item.created_at,
          invoice: item.transaksi ? item.transaksi.invoice : "",
          produk: "",
          barcode: "",
          nominal: moneyFormat(item.nominal),
          total_harga: item.transaksi ? moneyFormat(item.transaksi.total_harga) : "",
        });
      }
    });


    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.getCell("created_at").alignment = { horizontal: "left" };
      row.getCell("invoice").alignment = { horizontal: "left" };
      row.getCell("produk").alignment = { horizontal: "left" };
      row.getCell("barcode").alignment = { horizontal: "left" };
      row.getCell("nominal").alignment = { horizontal: "right" };
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
      created_at: "",
      invoice: "",
      produk: "",
      barcode: "TOTAL",
      nominal: `${moneyFormat(total._sum.nominal)}`,
    });
    totalRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: colNumber === 3 ? "right" : "center" };
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
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=profit_${req.query.start_date}_to_${req.query.end_date}.xlsx`
    );
    await workbook.xlsx.write(res);
    res.end();
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

module.exports = {
  filterProfit,
  exportProfit,
};
