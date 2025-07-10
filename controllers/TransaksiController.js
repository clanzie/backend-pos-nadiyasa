const express = require("express");
const prisma = require("../prisma/client");
const { generateRandomInvoice } = require("../utils/generateRandomInvoice");


const createTransaksi = async (req, res) => {
  try {
    const invoice = generateRandomInvoice(); 

    const userId = parseInt(req.userId);
    const customerId = parseInt(req.body.id_customer) || null;
    const tunai = parseInt(req.body.tunai);
    const kembalian = parseInt(req.body.kembalian);
    const diskon = parseInt(req.body.diskon);
    const totalHarga = parseInt(req.body.total_harga);
    const tanggalTransaksi = new Date();
    const metodeTransaksi = req.body.metode_transaksi;

    if (
      isNaN(customerId) ||
      isNaN(tunai) ||
      isNaN(kembalian) ||
      isNaN(diskon) ||
      isNaN(totalHarga)
    ) {
      return res.status(400).send({
        meta: {
          success: false,
          message: "Data inputan tidak vlaid. Silahkan periksa permintaan Anda",
        },
      });
    }

    const transaksi = await prisma.transaksi.create({
      data: {
        id_user: userId,
        id_customer: customerId,
        invoice: invoice,
        tunai: tunai,
        kembalian: kembalian,
        diskon: diskon,
        total_harga: totalHarga,
        tanggal_transaksi: tanggalTransaksi,
        metode_transaksi: metodeTransaksi,
      },
    });

   
    const keranjang = await prisma.keranjang.findMany({
      where: {
        id_user: userId,
      },
      include: {
        produk: true,
      },
    });

    for (const item of keranjang) {
      const harga = parseFloat(item.harga);

      await prisma.detailTransaksi.create({
        data: {
          id_transaksi: transaksi.id_transaksi,
          id_produk: item.id_produk,
          jumlah: item.jumlah,
          harga: harga,
        },
      });
      const totalHargaBeli = item.produk.harga_beli * item.jumlah;
      const totalHargaJual = item.produk.harga_jual * item.jumlah;
      const profit = totalHargaJual - totalHargaBeli;

      await prisma.profit.create({
        data: {
          id_transaksi: transaksi.id_transaksi,
          nominal: profit,
        },
      });

      await prisma.produk.update({
        where: {
          id_produk: item.id_produk,
        },
        data: {
          stok_produk: {
            decrement: item.jumlah,
          },
        },
      });

      await prisma.auditStok.create({
        data: {
          id_produk: item.id_produk,
          id_transaksi: transaksi.id_transaksi,
          jumlah: item.jumlah,
          jenis: "Penjualan",
          keterangan: "Transaksi Penjualan",
          tanggal: new Date(),
        },
      });
    }

    await prisma.keranjang.deleteMany({
      where: {
        id_user: userId,
      },
    });

    res.status(201).send({
      meta: {
        success: true,
        message: "Transaksi berhasil dibuat",
      },
      data: transaksi,
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

const findTransaksiByInvoice = async (req, res) => {
  const { invoice } = req.query;

  try {
    const transaksi = await prisma.transaksi.findFirst({
      where: {
        invoice: invoice,
      },
      select: {
        id_transaksi: true,
        id_user: true,
        id_customer: true,
        invoice: true,
        tunai: true,
        kembalian: true,
        diskon: true,
        total_harga: true,
        tanggal_transaksi: true,
        metode_transaksi: true,
        customer: {
          select: {
            nama_customer: true,
          },
        },
        user: {
          select: {
            username: true,
            created_at: true,
            updated_at: true,
          },
        },
        detail_transaksi: {
          select: {
            id_transaksi: true,
            id_produk: true,
            jumlah: true,
            harga: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
              },
            },
          },
        },
      },
    });

    if (!transaksi) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Transaksi dengan invoice ${invoice} tidak ditemukan`,
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan transaksi dengan invoice ${invoice}`,
      },
      data: transaksi,
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

const findTransaksiByTanggal = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).send({
        meta: {
          success: false,
          message: "start_date dan end_date harus diisi",
        },
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    endDate.setHours(23, 59, 59, 999);

    const transaksiList = await prisma.transaksi.findMany({
      where: {
        tanggal_transaksi: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        tanggal_transaksi: "desc",
      },
      select: {
        id_transaksi: true,
        id_user: true,
        id_customer: true,
        invoice: true,
        tunai: true,
        kembalian: true,
        diskon: true,
        total_harga: true,
        tanggal_transaksi: true,
        metode_transaksi: true,
        customer: {
          select: {
            nama_customer: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
        detail_transaksi: {
          select: {
            id_produk: true,
            jumlah: true,
            harga: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
              },
            },
          },
        },
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan transaksi dari ${start_date} hingga ${end_date}`,
      },
      data: transaksiList,
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

const findTransaksiById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaksi = await prisma.transaksi.findUnique({
      where: {
        id_transaksi: Number(id),
      },
      select: {
        id_transaksi: true,
        id_user: true,
        id_customer: true,
        invoice: true,
        tunai: true,
        kembalian: true,
        diskon: true,
        total_harga: true,
        tanggal_transaksi: true,
        metode_transaksi: true,
        customer: {
          select: {
            nama_customer: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
        detail_transaksi: {
          select: {
            id_produk: true,
            jumlah: true,
            harga: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
              },
            },
          },
        },
      },
    });

    if (!transaksi) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Transaksi dengan ID ${id} tidak ditemukan`,
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan transaksi dengan ID ${id}`,
      },
      data: transaksi,
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

const findAllTransaksi = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || undefined;
    const todayFlag = req.query.today === "1";

    let whereClause = {};
    if (todayFlag) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      whereClause = {
        tanggal_transaksi: {
          gte: today,
          lt: tomorrow,
        },
      };
    }

    const transaksiList = await prisma.transaksi.findMany({
      where: whereClause,
      orderBy: {
        tanggal_transaksi: "desc",
      },
      take: limit,
      select: {
        id_transaksi: true,
        id_user: true,
        id_customer: true,
        invoice: true,
        tunai: true,
        kembalian: true,
        diskon: true,
        total_harga: true,
        tanggal_transaksi: true,
        metode_transaksi: true,
        customer: {
          select: {
            nama_customer: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
        detail_transaksi: {
          select: {
            id_produk: true,
            jumlah: true,
            harga: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
              },
            },
          },
        },
      },
    });

    let transaksiHariIni = 0;
    if (todayFlag) {
      transaksiHariIni = transaksiList.length;
    } else {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      transaksiHariIni = await prisma.transaksi.count({
        where: {
          tanggal_transaksi: {
            gte: new Date(todayStr + "T00:00:00.000Z"),
            lt: new Date(todayStr + "T23:59:59.999Z"),
          },
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua transaksi",
      },
      data: transaksiList,
      transaksiHariIni: transaksiHariIni,
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

const printNotaByInvoice = async (req, res) => {
  try {
    const { invoice } = req.query;

    if (!invoice) {
      return res.status(400).send({
        meta: { success: false, message: "Invoice harus diisi" },
      });
    }

    const transaksi = await prisma.transaksi.findFirst({
      where: { invoice: invoice },
      select: {
        id_transaksi: true,
        invoice: true,
        tanggal_transaksi: true,
        tunai: true,
        kembalian: true,
        diskon: true,
        total_harga: true,
        metode_transaksi: true,
        user: { select: { username: true } },
        customer: { select: { nama_customer: true } },
        detail_transaksi: {
          select: {
            jumlah: true,
            harga: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
              },
            },
          },
        },
      },
    });

    if (!transaksi) {
      return res.status(404).send({
        meta: { success: false, message: `Transaksi dengan invoice ${invoice} tidak ditemukan` },
      });
    }

    res.status(200).send({
      meta: { success: true, message: "Data nota siap dicetak" },
      data: transaksi,
    });
  } catch (error) {
    res.status(500).send({
      meta: { success: false, message: "Terjadi kesalahan pada server" },
      data: error,
    });
  }
};

module.exports = {
  createTransaksi,
  findTransaksiByInvoice,
  findTransaksiByTanggal,
  findTransaksiById,
  findAllTransaksi,
  printNotaByInvoice,
};
