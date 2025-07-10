const express = require("express");
const prisma = require("../prisma/client");

const createReturSupplier = async (req, res) => {
  try {
    const { id_pengadaan, detail } = req.body;

    const pengadaan = await prisma.pengadaan.findUnique({
      where: { id_pengadaan: Number(id_pengadaan) },
      include: { detail_pengadaan: true },
    });

    if (!pengadaan) {
      return res.status(404).json({
        meta: { success: false, message: "Pengadaan tidak ditemukan" },
      });
    }

    let totalRetur = 0;

    const retur = await prisma.$transaction(async (tx) => {
      const returCreated = await tx.returSupplier.create({
        data: {
          id_pengadaan: pengadaan.id_pengadaan,
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

        await tx.detailReturSupplier.create({
          data: {
            id_retur_supplier: returCreated.id_retur_supplier,
            id_produk,
            jumlah,
            alasan: alasanItem,
          },
        });

        await tx.auditStok.create({
          data: {
            id_produk,
            id_retur_supplier: returCreated.id_retur_supplier,
            id_pengadaan: pengadaan.id_pengadaan,
            jumlah,
            jenis: "Retur ke Supplier - Penukaran",
            keterangan: alasanItem || "Penukaran ke supplier",
          },
        });
      }

      return {
        retur: returCreated,
        total_retur: totalRetur,
      };
    });

    res.status(201).send({
      meta: {
        success: true,
        message: "Retur supplier berhasil disimpan",
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

const findReturSupplier = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const whereClause = (search && !isNaN(Number(search)))
      ? { id_retur_supplier: Number(search) }
      : {};

    const returs = await prisma.returSupplier.findMany({
      where: whereClause,
      select: {
        id_retur_supplier: true,
        id_pengadaan: true,
        tanggal_retur: true,
        pengadaan: {
          select: {
            id_pengadaan: true,
            id_supplier: true,
            supplier: {
              select: {
                nama_supplier: true,
              },
            },
          },
        },
        detail_retur: {
          select: {
            id_produk: true,
            jumlah: true,
            alasan: true,
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
        id_retur_supplier: "desc",
      },
      skip: skip,
      take: limit,
    });

    const totalRetur = await prisma.returSupplier.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalRetur / limit);

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua retur supplier",
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

const findReturSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    const retur = await prisma.returSupplier.findUnique({
      where: {
        id_retur_supplier: Number(id),
      },
      select: {
        id_retur_supplier: true,
        id_pengadaan: true,
        tanggal_retur: true,
        pengadaan: {
          select: {
            id_pengadaan: true,
            id_supplier: true,
            supplier: {
              select: {
                nama_supplier: true,
              },
            },
          },
        },
        detail_retur: {
          select: {
            id_produk: true,
            jumlah: true,
            alasan: true,
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

    if (!retur) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Retur supplier dengan ID ${id} tidak ditemukan`,
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan detail retur supplier dengan ID ${id}`,
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

const findHargaBeliPengadaan = async (req, res) => {
  try {
    const { id_pengadaan, id_produk } = req.params;

    // Cari detail pengadaan yang sesuai
    const detail = await prisma.detailPengadaan.findFirst({
      where: {
        id_pengadaan: Number(id_pengadaan),
        id_produk: Number(id_produk),
      },
      select: {
        harga_beli: true,
        produk: {
          select: {
            nama_produk: true,
          },
        },
        pengadaan: {
          select: {
            id_pengadaan: true,
          },
        },
      },
    });

    if (!detail) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Harga beli untuk produk dengan ID ${id_produk} pada pengadaan ${id_pengadaan} tidak ditemukan`,
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan harga beli produk pada pengadaan`,
      },
      data: detail,
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


const findReturSupplierByPengadaanId = async (req, res) => {
  try {
    const { id_pengadaan } = req.params;

    const returs = await prisma.returSupplier.findMany({
      where: {
        id_pengadaan: Number(id_pengadaan),
      },
      select: {
        id_retur_supplier: true,
        id_pengadaan: true,
        tanggal_retur: true,
        pengadaan: {
          select: {
            id_pengadaan: true,
            id_supplier: true,
            supplier: {
              select: {
                nama_supplier: true,
              },
            },
          },
        },
        detail_retur: {
          select: {
            id_produk: true,
            jumlah: true,
            alasan: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
                harga_beli: true,
              },
            },
          },
        },
      },
      orderBy: {
        tanggal_retur: "desc",
      },
    });

    if (!returs || returs.length === 0) {
      return res.status(200).send({
        meta: {
          success: false,
          message: `Tidak ada retur supplier untuk pengadaan dengan ID ${id_pengadaan}`,
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan retur supplier untuk pengadaan dengan ID ${id_pengadaan}`,
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

const laporanReturSupplier = async (req, res) => {
  try {
    const { bulan, tahun, id_supplier } = req.query;

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

    if (id_supplier) {
      where.pengadaan = {
        id_supplier: Number(id_supplier)
      };
    }

    const returs = await prisma.returSupplier.findMany({
      where,
      select: {
        id_retur_supplier: true,
        id_pengadaan: true,
        tanggal_retur: true,
        pengadaan: {
          select: {
            id_pengadaan: true,
            id_supplier: true,
            supplier: {
              select: {
                nama_supplier: true,
              },
            },
          },
        },
        detail_retur: {
          select: {
            id_produk: true,
            jumlah: true,
            alasan: true,
            produk: {
              select: {
                nama_produk: true,
                harga_jual: true,
                harga_beli: true,
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
        message: "Berhasil mendapatkan laporan retur supplier",
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
  createReturSupplier,
  findReturSupplier,
  findReturSupplierById,
  findHargaBeliPengadaan,
  findReturSupplierByPengadaanId,
  laporanReturSupplier,
};
