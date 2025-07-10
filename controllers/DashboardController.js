const express = require("express");
const prisma = require("../prisma/client");
const { subDays, format } = require("date-fns");

const getDashboardData = async (req, res) => {
  try {
    const today = new Date();
    const month = subDays(today, 31);

    const chartSalesMonth = await prisma.transaksi.groupBy({
      by: ["tanggal_transaksi"],
      where: {
        tanggal_transaksi: {
          gte: month,
        },
      },
      _sum: {
        total_harga: true,
      },
    });

    let sales_date = [];
    let sales_total = [];

    let sumSalesWeek = 0;

    if (chartSalesMonth.length > 0) {
      chartSalesMonth.forEach((item) => {
        sales_date.push(format(new Date(item.tanggal_transaksi), "dd/MM/yyyy"));
        const total = parseInt(item._sum.total_harga || 0);
        sales_total.push(total);
        sumSalesWeek += total;
      });
    } else {
      sales_date.push("");
      sales_total.push(0);
    }

    const chartProfitMonth = await prisma.profit.groupBy({
      by: ["created_at"],
      where: {
        created_at: {
          gte: month,
        },
      },
      _sum: {
        nominal: true,
      },
    });

    let profit_date = [];
    let profit_total = [];
    let sumProfitWeek = 0;

    if (chartProfitMonth.length > 0) {
      chartProfitMonth.forEach((item) => {
        profit_date.push(format(new Date(item.created_at), "dd/MM/yyyy"));
        const total = parseInt(item._sum.nominal || 0);
        profit_total.push(total);
        sumProfitWeek += total;
      });
    } else {
      profit_date.push("");
      profit_total.push(0);
    }

    const countSalesToday = await prisma.transaksi.count({
      where: {
        created_at: {
          gte: new Date(`${today.toISOString().split("T")[0]}T00:00:00.000Z`),
          lte: new Date(`${today.toISOString().split("T")[0]}T23:59:59.999Z`),
        },
      },
    });

    const sumSalesToday = await prisma.transaksi.aggregate({
      _sum: {
        total_harga: true,
      },
      where: {
        created_at: {
          gte: new Date(`${today.toISOString().split("T")[0]}T00:00:00.000Z`),
          lte: new Date(`${today.toISOString().split("T")[0]}T23:59:59.999Z`),
        },
      },
    });

    const sumProfitToday = await prisma.profit.aggregate({
      _sum: {
        nominal: true,
      },
      where: {
        created_at: {
          gte: new Date(`${today.toISOString().split("T")[0]}T00:00:00.000Z`),
          lte: new Date(`${today.toISOString().split("T")[0]}T23:59:59.999Z`),
        },
      },
    });

    const produkLimitStock = await prisma.produk.findMany({
      where: {
        stok_produk: {
          lte: 5,
        },
      },
      include: {
        kategori: true,
      },
    });

    const chartBestProduk = await prisma.detailTransaksi.groupBy({
      by: ["id_produk"],
      _sum: {
        jumlah: true,
      },
      orderBy: {
        _sum: {
          jumlah: "desc",
        },
      },
      take: 5,
    });

    const produkTerlaris = chartBestProduk.map((item) => item.id_produk);
    const produk = await prisma.produk.findMany({
      where: {
        id_produk: {
          in: produkTerlaris,
        },
      },
      select: {
        id_produk: true,
        nama_produk: true,
        gambar_produk: true,
      },
    });

    const bestSellingProduk = chartBestProduk.map((item) => {
      const produkItem = produk.find((p) => p.id_produk === item.id_produk);
      return {
        id_produk: item.id_produk,
        nama_produk: produkItem?.nama_produk || "Unknown Produk",
        gambar_produk: produkItem?.gambar_produk || "",
        total: item._sum.jumlah,
      };
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan data dashboard",
      },
      data: {
        countSalesToday: countSalesToday,
        sum_sales_today: sumSalesToday._sum.total_harga || 0,
        sum_sales_week: sumSalesWeek || 0,
        sum_profit_today: sumProfitToday._sum.nominal || 0,
        sum_profit_week: sumProfitWeek || 0,
        sales: {
          sales_date,
          sales_total,
        },
        profits: {
          profit_date,
          profit_total,
        },
        produk_limit_stock: produkLimitStock,
        best_selling_produk: bestSellingProduk,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      errors: error.message,
    });
  }
};

module.exports = {
  getDashboardData,
};
