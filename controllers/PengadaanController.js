const express = require("express");
const prisma = require("../prisma/client");

const createPengadaan = async (req, res) => {
  try {
    const { id_supplier, id_gudang, detail_pengadaan } = req.body;

    if (
      !detail_pengadaan ||
      !Array.isArray(detail_pengadaan) ||
      detail_pengadaan.length === 0
    ) {
      return res.status(400).send({
        meta: {
          success: false,
          message: "Detail pengadaan tidak boleh kosong dan harus berupa array",
        },
      });
    }

    let totalHarga = 0;
    let totalProduk = 0;

    const pengadaan = await prisma.$transaction(async (tx) => {
      const pengadaanCreated = await tx.pengadaan.create({
        data: {
          id_supplier: parseInt(id_supplier),
          tanggal_pengadaan: new Date(),
          total_harga: totalHarga,
          total_produk: totalProduk,
        },
      });

      for (const item of detail_pengadaan) {
        const { id_produk, jumlah_produk, harga_beli } = item;
        totalHarga += harga_beli * jumlah_produk;

        await tx.detailPengadaan.create({
          data: {
            id_pengadaan: pengadaanCreated.id_pengadaan,
            id_produk: parseInt(id_produk),
            jumlah_produk: parseInt(jumlah_produk),
            harga_beli: parseFloat(harga_beli),
            sub_total_harga: parseFloat(harga_beli) * parseInt(jumlah_produk),
          },
        });

        await tx.detailGudang.upsert({
          where: {
            id_produk_id_gudang: {
              id_produk: parseInt(id_produk),
              id_gudang: parseInt(id_gudang),
            },
          },
          update: {
            stok_gudang: {
              increment: parseInt(jumlah_produk),
            },
          },
          create: {
            id_produk: parseInt(id_produk),
            id_gudang: parseInt(id_gudang),
            stok_gudang: parseInt(jumlah_produk),
          },
        });

        const produkLama = await tx.produk.findUnique({
          where: { id_produk: parseInt(id_produk) },
          select: { harga_beli: true },
        });
        if (produkLama && parseFloat(harga_beli) > produkLama.harga_beli) {
          await tx.produk.update({
            where: { id_produk: parseInt(id_produk) },
            data: { harga_beli: parseFloat(harga_beli) },
          });
        }

        await tx.auditStok.create({
          data: {
            id_produk: parseInt(id_produk),
            id_pengadaan: pengadaanCreated.id_pengadaan,
            id_gudang: parseInt(id_gudang),
            jumlah: parseInt(jumlah_produk),
            jenis: "Pengadaan",
            keterangan: `Pengadaan barang ke gudang ${id_gudang}`,
            tanggal: new Date(),
          },
        });
      }

      totalProduk = detail_pengadaan.length;

      await tx.pengadaan.update({
        where: {
          id_pengadaan: pengadaanCreated.id_pengadaan,
        },
        data: {
          total_harga: totalHarga,
          total_produk: totalProduk,
        },
      });

      return pengadaanCreated;
    });

    res.status(201).send({
      meta: {
        success: true,
        message: "Pengadaan berhasil dibuat",
      },
      data: pengadaan,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      errors: error,
    });
  }
};

const getAllPengadaan = async (req, res) => {
  try {
    const pengadaan = await prisma.pengadaan.findMany({
      select: {
        tanggal_pengadaan: true,
        total_harga: true,
        total_produk: true,
        supplier: {
          select: {
            nama_supplier: true,
          },
        },
        detail_pengadaan: {
          select: {
            produk: {
              select: {
                nama_produk: true,
              },
            },
            harga_beli: true,
            jumlah_produk: true,
            sub_total_harga: true,
          },
        },
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua pengadaan",
      },
      data: pengadaan,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      errors: error,
    });
  }
};

const findPengadaan = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const pengadaan = await prisma.pengadaan.findMany({
      where: {
        supplier: {
          nama_supplier: {
            contains: search,
          },
        },
      },
      select: {
        id_pengadaan: true,
        tanggal_pengadaan: true,
        total_harga: true,
        total_produk: true,
        supplier: {
          select: {
            nama_supplier: true,
          },
        },
        detail_pengadaan: {
          select: {
            produk: {
              select: {
                nama_produk: true,
                satuan: true,
              },
            },
            harga_beli: true,
            jumlah_produk: true,
            sub_total_harga: true,
          },
        },
      },
      orderBy: {
        id_pengadaan: "desc",
      },
      skip: skip,
      take: limit,
    });

    const totalPengadaan = await prisma.pengadaan.count({
      where: {
        supplier: {
          nama_supplier: {
            contains: search,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalPengadaan / limit);

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua pengadaan",
      },
      data: pengadaan,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalPengadaan,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      errors: error,
    });
  }
};

const findPengadaanById = async (req, res) => {
  try {
    const { id } = req.params;

    const pengadaan = await prisma.pengadaan.findUnique({
      where: {
        id_pengadaan: parseInt(id),
      },
      select: {
        id_pengadaan: true,
        id_supplier: true,
        tanggal_pengadaan: true,
        total_harga: true,
        total_produk: true,
        supplier: {
          select: {
            nama_supplier: true,
          },
        },
        detail_pengadaan: {
          select: {
            id_produk: true,
            produk: {
              select: {
                id_produk: true,
                nama_produk: true,
                satuan: true,
              },
            },
            harga_beli: true,
            jumlah_produk: true,
            sub_total_harga: true,
          },
        },
      },
    });

    if (!pengadaan) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Pengadaan dengan ID ${id} tidak ditemukan`,
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan pengadaan dengan ID ${id}`,
      },
      data: pengadaan,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      errors: error,
    });
  }
};

const laporanPengadaan = async (req, res) => {
  try {
    const { bulan, tahun, id_supplier } = req.query;
    let where = {};
    if (bulan && tahun) {
      const startDate = new Date(Number(tahun), Number(bulan) - 1, 1, 0, 0, 0);
      const endDate = new Date(Number(tahun), Number(bulan), 0, 23, 59, 59, 999);
      where.tanggal_pengadaan = {
        gte: startDate,
        lte: endDate,
      };
    } else if (tahun) {
      const startDate = new Date(Number(tahun), 0, 1, 0, 0, 0);
      const endDate = new Date(Number(tahun), 11, 31, 23, 59, 59, 999);
      where.tanggal_pengadaan = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (id_supplier) {
      where.id_supplier = Number(id_supplier);
    }

    const pengadaan = await prisma.pengadaan.findMany({
      where,
      select: {
        id_pengadaan: true,
        tanggal_pengadaan: true,
        total_harga: true,
        total_produk: true,
        supplier: {
          select: {
            id_supplier: true,
            nama_supplier: true,
          },
        },
        detail_pengadaan: {
          select: {
            produk: {
              select: {
                nama_produk: true,
                satuan: true,
              },
            },
            harga_beli: true,
            jumlah_produk: true,
            sub_total_harga: true,
          },
        },
      },
      orderBy: {
        tanggal_pengadaan: "desc",
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan laporan pengadaan",
      },
      data: pengadaan,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      errors: error,
    });
  }
};

const updatePengadaan = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_supplier, id_gudang, detail_pengadaan } = req.body;

    if (
      !detail_pengadaan ||
      !Array.isArray(detail_pengadaan) ||
      detail_pengadaan.length === 0
    ) {
      return res.status(400).send({
        meta: {
          success: false,
          message: "Detail pengadaan tidak boleh kosong dan harus berupa array",
        },
      });
    }

    let totalHarga = 0;
    let totalProduk = 0;

    const pengadaan = await prisma.$transaction(async (tx) => {
      const pengadaanLama = await tx.pengadaan.findUnique({
        where: { id_pengadaan: parseInt(id) },
        include: {
          detail_pengadaan: true,
        },
      });

      if (!pengadaanLama) {
        throw new Error(`Pengadaan dengan ID ${id} tidak ditemukan`);
      }

      for (const item of pengadaanLama.detail_pengadaan) {
        await tx.detailGudang.update({
          where: {
            id_produk_id_gudang: {
              id_produk: item.id_produk,
              id_gudang: parseInt(id_gudang),
            },
          },
          data: {
            stok_gudang: {
              decrement: item.jumlah_produk,
            },
          },
        });
      }

      await tx.detailPengadaan.deleteMany({
        where: { id_pengadaan: parseInt(id) },
      });

      await tx.auditStok.deleteMany({
        where: {
          id_pengadaan: parseInt(id),
        },
      });

      await tx.pengadaan.update({
        where: { id_pengadaan: parseInt(id) },
        data: {
          id_supplier: parseInt(id_supplier),
          tanggal_pengadaan: new Date(),
        },
      });

      for (const item of detail_pengadaan) {
        const { id_produk, jumlah_produk, harga_beli } = item;
        totalHarga += harga_beli * jumlah_produk;

        await tx.detailPengadaan.create({
          data: {
            id_pengadaan: parseInt(id),
            id_produk: parseInt(id_produk),
            jumlah_produk: parseInt(jumlah_produk),
            harga_beli: parseFloat(harga_beli),
            sub_total_harga: parseFloat(harga_beli) * parseInt(jumlah_produk),
          },
        });

        await tx.detailGudang.upsert({
          where: {
            id_produk_id_gudang: {
              id_produk: parseInt(id_produk),
              id_gudang: parseInt(id_gudang),
            },
          },
          update: {
            stok_gudang: {
              increment: parseInt(jumlah_produk),
            },
          },
          create: {
            id_produk: parseInt(id_produk),
            id_gudang: parseInt(id_gudang),
            stok_gudang: parseInt(jumlah_produk),
          },
        });

        const produkLama = await tx.produk.findUnique({
          where: { id_produk: parseInt(id_produk) },
          select: { harga_beli: true },
        });
        if (produkLama && parseFloat(harga_beli) > produkLama.harga_beli) {
          await tx.produk.update({
            where: { id_produk: parseInt(id_produk) },
            data: { harga_beli: parseFloat(harga_beli) },
          });
        }

        await tx.auditStok.create({
          data: {
            id_produk: parseInt(id_produk),
            id_pengadaan: parseInt(id),
            id_gudang: parseInt(id_gudang),
            jumlah: parseInt(jumlah_produk),
            jenis: "Pengadaan",
            keterangan: `Update pengadaan barang ke gudang ${id_gudang}`,
            tanggal: new Date(),
          },
        });
      }

      totalProduk = detail_pengadaan.length;

      await tx.pengadaan.update({
        where: { id_pengadaan: parseInt(id) },
        data: {
          total_harga: totalHarga,
          total_produk: totalProduk,
        },
      });

      return await tx.pengadaan.findUnique({
        where: { id_pengadaan: parseInt(id) },
        include: {
          supplier: true,
          detail_pengadaan: {
            include: {
              produk: true,
            },
          },
        },
      });
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Pengadaan berhasil diupdate",
      },
      data: pengadaan,
    });
  } catch (error) {
    console.error(error.message);
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
  createPengadaan,
  getAllPengadaan,
  findPengadaan,
  findPengadaanById,
  laporanPengadaan,
  updatePengadaan,
};
