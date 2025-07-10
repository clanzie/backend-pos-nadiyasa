const express = require("express");
const prisma = require("../prisma/client");
const { id } = require("date-fns/locale");

const createReturCustomer = async (req, res) => {
  try {
    const { invoice, detail } = req.body;

    const transaksi = await prisma.transaksi.findUnique({
      where: { invoice },
      include: { detail_transaksi: true },
    });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi tidak ditemukan",
      });
    }

    let totalPengembalian = 0;

    const retur = await prisma.$transaction(async (tx) => {
      const returCreated = await tx.returCustomer.create({
        data: {
          id_transaksi: transaksi.id_transaksi,
          invoice,
          tanggal_retur: new Date(),
        },
      });

      for (const item of detail) {
        const { id_produk, jumlah, alasan: alasanItem, jenis } = item;

        const produk = await tx.produk.findUnique({
          where: { id_produk },
        });

        if (!produk) {
          throw new Error(`Produk dengan ID ${id_produk} tidak ditemukan`);
        }

        await tx.detailReturCustomer.create({
          data: {
            id_retur_customer: returCreated.id_retur_customer,
            id_produk,
            jumlah,
            alasan: alasanItem,
            jenis,
          },
        });

        if (jenis === "pengembalian") {
          await tx.produk.update({
            where: { id_produk },
            data: {
              stok_produk: {
                increment: jumlah,
              },
            },
          });

          totalPengembalian += produk.harga_jual * jumlah;

          await tx.auditStok.create({
            data: {
              id_produk,
              id_retur_customer: returCreated.id_retur_customer,
              id_transaksi: transaksi.id_transaksi,
              jumlah,
              jenis: "Retur dari Customer - Pengembalian Dana",
              keterangan: alasanItem || "Retur dana dari customer",
            },
          });
        } else if (jenis === "penukaran") {
          await tx.auditStok.create({
            data: {
              id_produk,
              id_retur_customer: returCreated.id_retur_customer,
              id_transaksi: transaksi.id_transaksi,
              jumlah,
              jenis: "Retur dari Customer - Penukaran Produk",
              keterangan: alasanItem || "Penukaran produk dari customer",
            },
          });
        }
      }

      return {
        retur: returCreated,
        total_pengembalian: totalPengembalian,
      };
    });

    res.status(201).send({
      meta: {
        success: true,
        message: "Retur berhasil disimpan",
      },
      data: retur,
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

const getAllReturCustomer = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const returs = await prisma.returCustomer.findMany({
      where: {
        invoice: {
          contains: search,
        },
      },
      select: {
        id_retur_customer: true,
        invoice: true,
        tanggal_retur: true,
        detail_retur: {
          select: {
            id_produk: true,
            jumlah: true,
            alasan: true,
            jenis: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
              },
            },
          },
        },
      },
      orderBy: {
        id_retur_customer: "desc",
      },
      skip: skip,
      take: limit,
    });

    const totalRetur = await prisma.returCustomer.count({
      where: {
        invoice: {
          contains: search,
        },
      },
    });

    const totalPages = Math.ceil(totalRetur / limit)

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua retur customer",
      },
      data: returs,
      pagination: {
        total: totalRetur,
        currentPage: page,
        perPage: limit,
        totalPages: totalPages,
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

const findReturCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const retur = await prisma.returCustomer.findUnique({
      where: {
        id_retur_customer: Number(id),
      },
      select: {
        id_retur_customer: true,
        id_transaksi: true,
        invoice: true,
        tanggal_retur: true,
        detail_retur: {
          select: {
            id_produk: true,
            jumlah: true,
            alasan: true,
            jenis: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
              },
            },
          },
        },
        transaksi: {
          select: {
            id_transaksi: true,
            total_harga: true,
          }
        },
      },
    });

    if (!retur) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Retur customer dengan ID ${id} tidak ditemukan`,
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan detail retur customer dengan ID ${id}`,
      },
      data: retur,
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

const findHarga = async (req, res) => {
  try {
    const { id_produk, id_transaksi } = req.params;
    const detailTransaksi = await prisma.detailTransaksi.findFirst({
      where: {
        id_produk: Number(id_produk),
        id_transaksi: Number(id_transaksi),
      },
      select: {
        harga: true,
        jumlah: true
      },
    });

    detailTransaksi.harga = detailTransaksi.harga / detailTransaksi.jumlah;

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan harga produk dengan ID ${id_produk}`,
      },
      data: detailTransaksi,
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
}

const findReturCustomerByInvoice = async (req, res) => {
  try {
    const { invoice } = req.params;

    const retur = await prisma.returCustomer.findFirst({
      where: {
        invoice: invoice,
      },
      select: {
        id_retur_customer: true,
        id_transaksi: true,
        invoice: true,
        tanggal_retur: true,
        detail_retur: {
          select: {
            id_produk: true,
            jumlah: true,
            alasan: true,
            jenis: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
              },
            },
          },
        },
        transaksi: {
          select: {
            id_transaksi: true,
            total_harga: true
          }
        },
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan retur customer dengan invoice ${invoice}`,
      },
      data: retur,
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

const laporanReturCustomer = async (req, res) => {
  try {
    const { bulan, tahun, id_customer } = req.query;
    let where = {};
    if (bulan && tahun) {
      const startDate = new Date(Number(tahun), Number(bulan) - 1, 1, 0, 0, 0);
      const endDate = new Date(Number(tahun), Number(bulan), 0, 23, 59, 59, 999);
      where.tanggal_retur = {
        gte: startDate,
        lte: endDate,
      };
    } else if (tahun) {
      const startDate = new Date(Number(tahun), 0, 1, 0, 0, 0);
      const endDate = new Date(Number(tahun), 11, 31, 23, 59, 59, 999);
      where.tanggal_retur = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (id_customer) {
      if (id_customer === "umum") {
        where.transaksi = { id_customer: null };
      } else {
        where.transaksi = { id_customer: Number(id_customer) };
      }
    }

    const returs = await prisma.returCustomer.findMany({
      where,
      select: {
        id_retur_customer: true,
        invoice: true,
        tanggal_retur: true,
        transaksi: {
          select: {
            id_transaksi: true,
            total_harga: true,
            id_customer: true,
            user: {
              select: {
                username: true
              }
            }
          }
        },
        detail_retur: {
          select: {
            id_produk: true,
            jumlah: true,
            alasan: true,
            jenis: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
              },
            },
          },
        },
      },
      orderBy: {
        tanggal_retur: "desc",
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan laporan retur customer",
      },
      data: returs,
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


module.exports = {
  createReturCustomer,
  getAllReturCustomer,
  findReturCustomerById,
  findHarga,
  findReturCustomerByInvoice,
  laporanReturCustomer,
};
