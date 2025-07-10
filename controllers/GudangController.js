const express = require("express");
const prisma = require("../prisma/client");
const fs = require("fs");

const findGudang = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const gudang = await prisma.gudang.findMany({
      where: {
        nama_gudang: {
          contains: search,
        },
      },
      select: {
        id_gudang: true,
        nama_gudang: true,
        alamat_gudang: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        id_gudang: "desc",
      },
      skip: skip,
      take: limit,
    });

    const totalGudang = await prisma.gudang.count({
      where: {
        nama_gudang: {
          contains: search,
        },
      },
    });

    const totalPages = Math.ceil(totalGudang / limit); 

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua gudang",
      },
      data: gudang,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalGudang,
      },
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      error: error.message,
    });
  }
};

// Fungsi create gudang

const createGudang = async (req, res) => {
  try {
    const gudang = await prisma.gudang.create({
      data: {
        nama_gudang: req.body.nama_gudang,
        alamat_gudang: req.body.alamat_gudang,
      },
    });

    res.status(201).send({
      meta: {
        success: true,
        message: "Berhasil menambahkan gudang",
      },
      data: gudang,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      error: error.message,
    });
  }
};

// Fungsi find gudang by id
const findGudangById = async (req, res) => {
  const { id } = req.params;
  try {
    const gudang = await prisma.gudang.findUnique({
      where: {
        id_gudang: Number(id),
      },
      select: {
        id_gudang: true,
        nama_gudang: true,
        alamat_gudang: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!gudang) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `gudang dengan id ${id} tidak ditemukan`,
        },
      });
    }
    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan gudang",
      },
      data: gudang,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      error: error.message,
    });
  }
};

// Fungsi update gudang
const updateGudang = async (req, res) => {
  const { id } = req.params;
  try {
    const dataGudang = {
      nama_gudang: req.body.nama_gudang,
      alamat_gudang: req.body.alamat_gudang,
      updated_at: new Date(),
    };

    const gudang = await prisma.gudang.update({
      where: {
        id_gudang: Number(id),
      },
      data: dataGudang,
    });

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil memperbarui data gudang id ${id}`,
      },
      data: gudang,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      error: error.message,
    });
  }
};

const deleteGudang = async (req, res) => {
  const { id } = req.params;
  try {
    const gudang = await prisma.gudang.findUnique({
      where: {
        id_gudang: Number(id),
      },
    });

    if (!gudang) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `gudang dengan id ${id} tidak ditemukan`,
        },
      });
    }

    await prisma.gudang.delete({
      where: {
        id_gudang: Number(id),
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil menghapus gudang dengan id ${id}`,
      },
      data: gudang,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan pada server",
      },
      error: error.message,
    });
  }
};

const pindahStokAntarGudang = async (req, res) => {
  const { id_produk, id_gudang_asal, id_gudang_tujuan, jumlah } = req.body;

  try {
    if (!id_produk || !id_gudang_asal || !id_gudang_tujuan || !jumlah) {
      return res.status(400).send({
        meta: { success: false, message: "Data tidak lengkap" },
      });
    }
    if (id_gudang_asal === id_gudang_tujuan) {
      return res.status(400).send({
        meta: { success: false, message: "Gudang asal dan tujuan tidak boleh sama" },
      });
    }

    const gudangAsal = await prisma.gudang.findUnique({
      where: { id_gudang: Number(id_gudang_asal) },
      select: { nama_gudang: true }
    });
    const gudangTujuan = await prisma.gudang.findUnique({
      where: { id_gudang: Number(id_gudang_tujuan) },
      select: { nama_gudang: true }
    });

    const stokAsal = await prisma.detailGudang.findUnique({
      where: {
        id_produk_id_gudang: {
          id_produk: Number(id_produk),
          id_gudang: Number(id_gudang_asal),
        },
      },
    });

    if (!stokAsal || stokAsal.stok_gudang < jumlah) {
      return res.status(400).send({
        meta: { success: false, message: "Stok di gudang asal tidak cukup" },
      });
    }

    await prisma.detailGudang.update({
      where: {
        id_produk_id_gudang: {
          id_produk: Number(id_produk),
          id_gudang: Number(id_gudang_asal),
        },
      },
      data: {
        stok_gudang: { decrement: Number(jumlah) },
      },
    });
    
    await prisma.detailGudang.upsert({
      where: {
        id_produk_id_gudang: {
          id_produk: Number(id_produk),
          id_gudang: Number(id_gudang_tujuan),
        },
      },
      update: {
        stok_gudang: { increment: Number(jumlah) },
      },
      create: {
        id_produk: Number(id_produk),
        id_gudang: Number(id_gudang_tujuan),
        stok_gudang: Number(jumlah),
      },
    });

    await prisma.auditStok.create({
      data: {
        id_produk: Number(id_produk),
        id_gudang: Number(id_gudang_asal),
        jumlah: Number(jumlah),
        jenis: "KELUAR",
        keterangan: `Pindah ke ${gudangTujuan?.nama_gudang || id_gudang_tujuan}`,
      },
    });
    await prisma.auditStok.create({
      data: {
        id_produk: Number(id_produk),
        id_gudang: Number(id_gudang_tujuan),
        jumlah: Number(jumlah),
        jenis: "MASUK",
        keterangan: `Pindahan dari ${gudangAsal?.nama_gudang || id_gudang_asal}`,
      },
    });

    res.status(200).send({
      meta: { success: true, message: "Stok berhasil dipindahkan antar gudang" },
    });
  } catch (error) {
    res.status(500).send({
      meta: { success: false, message: "Terjadi kesalahan pada server" },
      error: error.message,
    });
  }
};

module.exports = {
  findGudang,
  createGudang,
  findGudangById,
  updateGudang,
  deleteGudang,
  pindahStokAntarGudang,
};
