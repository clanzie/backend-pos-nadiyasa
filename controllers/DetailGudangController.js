const express = require("express");
const prisma = require("../prisma/client");
const fs = require("fs");

const createDetailGudang = async (req, res) => {
  try {
    const detailGudang = await prisma.detailGudang.create({
      data: {
        id_produk: parseInt(req.body.id_produk),
        id_gudang: parseInt(req.body.id_gudang),
        stok_gudang: parseInt(req.body.stok_gudang),
      },
      include: {
        produk: true,
        gudang: true,
      },
    });

    res.status(201).send({
      meta: {
        success: true,
        message: "Berhasil menambahkan detail gudang",
      },
      data: detailGudang,
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

const findDetailGudangById = async (req, res) => {
  const { id_produk, id_gudang } = req.params;
  try {
    const detailGudang = await prisma.detailGudang.findUnique({
      where: {
        id_produk_id_gudang: {
          id_produk: parseInt(id_produk),
          id_gudang: parseInt(id_gudang),
        },
      },
      select: {
        stok_gudang: true,
        created_at: true,
        updated_at: true,
        produk: {
          select: {
            id_produk: true,
            nama_produk: true,
            barcode_produk: true,
            satuan: true,
            stok_produk: true,
            harga_beli: true,
            harga_jual: true,
            gambar_produk: true,
          },
        },
        gudang: {
          select: {
            id_gudang: true,
            nama_gudang: true,
            alamat_gudang: true,
          },
        },
      },
    });
    if (!detailGudang) {
      return res.status(404).send({
        meta: {
          success: false,
          message: "Detail gudang tidak ditemukan",
        },
      });
    }
    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan detail gudang",
      },
      data: detailGudang,
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

const updateDetailGudang = async (req, res) => {
  const { id_produk, id_gudang } = req.params;

  try {
    const updatedDetailGudang = await prisma.detailGudang.update({
      where: {
        id_produk_id_gudang: {
          id_produk: parseInt(id_produk),
          id_gudang: parseInt(id_gudang),
        },
      },
      data: {
        stok_gudang: parseInt(req.body.stok_gudang),
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil memperbarui detail gudang",
      },
      data: updatedDetailGudang,
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

const deleteDetailGudang = async (req, res) => {
  const { id_produk, id_gudang } = req.params;

  try {
    const existingDetail = await prisma.detailGudang.findUnique({
      where: {
        id_produk_id_gudang: {
          id_produk: parseInt(id_produk),
          id_gudang: parseInt(id_gudang),
        },
      },
    });

    if (!existingDetail) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Detail gudang dengan id_produk ${id_produk} dan id_gudang ${id_gudang} tidak ditemukan`,
        },
      });
    }

    await prisma.detailGudang.delete({
      where: {
        id_produk_id_gudang: {
          id_produk: parseInt(id_produk),
          id_gudang: parseInt(id_gudang),
        },
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil menghapus detail gudang",
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

const findAllDetailGudangByGudang = async (req, res) => {
  const { id_gudang } = req.params;
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const detailGudang = await prisma.detailGudang.findMany({
      where: {
        id_gudang: Number(id_gudang),
      },
      select:{
        id_produk: true,
        stok_gudang: true,
        created_at: true,
        updated_at: true,
        produk: {
          select: {
            id_produk: true,
            nama_produk: true,
            barcode_produk: true,
            satuan: true,
            stok_produk: true,
            harga_beli: true,
            harga_jual: true,
            gambar_produk: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
      skip: skip,
      take: limit,
    });

    const totalDetailGudang = await prisma.detailGudang.count({
      where: {
        id_gudang: Number(id_gudang),
      },
    });

    const totalPages = Math.ceil(totalDetailGudang / limit);

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan detail gudang berdasarkan gudang ID: ${id_gudang}`,
      },
      data: detailGudang,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalDetailGudang,
      },
    })
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

const findDetailProdukByProduk = async (req, res) => {
  try{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const detailGudang = await prisma.detailGudang.findMany({
      where: {
        produk: {
          nama_produk: {
            contains: search,
          },
        },
      },
      select:{
        id_produk: true,
        stok_gudang: true,
        created_at: true,
        updated_at: true,
        produk: {
          select: {
            id_produk: true,
            nama_produk: true,
            barcode_produk: true,
            satuan: true,
            stok_produk: true,
            harga_beli: true,
            harga_jual: true,
            gambar_produk: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
      skip: skip,
      take: limit,
    })

    const totalDetailGudang = await prisma.detailGudang.count({
      where: {
        produk: {
          nama_produk: {
            contains: search,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalDetailGudang / limit);

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan detail gudang berdasarkan produk`,
      },
      data: detailGudang,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalDetailGudang,
      },
    })

  }catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      data: error,
    });
  }
}

module.exports = {
  createDetailGudang,
  findDetailGudangById,
  updateDetailGudang,
  deleteDetailGudang,
  findAllDetailGudangByGudang,
  findDetailProdukByProduk,
};
