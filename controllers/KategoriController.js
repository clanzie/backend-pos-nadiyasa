const express = require("express");
const prisma = require("../prisma/client");
const fs = require("fs");


const findKategori = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const kategori = await prisma.kategori.findMany({
      where: {
        nama_kategori: {
          contains: search,
        },
      },
      select: {
        id_kategori: true,
        nama_kategori: true,
        gambar_kategori: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        id_kategori: "desc",
      },
      skip: skip,
      take: limit,
    });

    const totalKategori = await prisma.kategori.count({
      where: {
        nama_kategori: {
          contains: search,
        },
      },
    });

    const totalPages = Math.ceil(totalKategori / limit); 

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua kategori",
      },
      data: kategori,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalKategori,
      },
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Kesalahan internal server",
      },
      data: error,
    });
  }
};

const createKategori = async (req, res) => {
  const { nama_kategori, } = req.body;

  try {
    const kategori = await prisma.kategori.create({
      data: {
        nama_kategori: nama_kategori,
        gambar_kategori: req.file.path,
      },
    });

    res.status(201).send({
      meta: {
        success: true,
        message: "Berhasil menambahkan kategori",
      },
      data: kategori,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Kesalahan internal server",
      },
      data: error,
    });
  }
};

const findKategoriById = async (req, res) => {
  const { id } = req.params;
  try {
    const kategori = await prisma.kategori.findUnique({
      where: {
        id_kategori: parseInt(id),
      },
      select: {
        id_kategori: true,
        nama_kategori: true,
        gambar_kategori: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!kategori) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Kategori dengan ID: ${id} tidak ditemukan`,
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan kategori dengan ID: ${id}`,
      },
      data: kategori,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Kesalahan internal server",
      },
      data: error,
    });
  }
};


const updateKategori = async (req, res) => {
  const { id } = req.params;
  try {
    const dataKategori = {
      nama_kategori: req.body.nama_kategori,
      updated_at: new Date(),
    };

    if (req.file) {
      dataKategori.gambar_kategori = req.file.path;

      const kategori = await prisma.kategori.findUnique({
        where: {
          id_kategori: Number(id),
        },
      });

      if (kategori.gambar_kategori) {
        fs.unlinkSync(kategori.gambar_kategori);
      }
    }

    const kategori = await prisma.kategori.update({
      where: {
        id_kategori: Number(id),
      },
      data: dataKategori,
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Kategori berhasil diupdate",
      },
      data: kategori,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Kesalahan internal server",
      },
      data: error,
    });
  }
};

const deleteKategori = async (req, res) => {
  const { id } = req.params;
  try {
    const kategori = await prisma.kategori.findUnique({
      where: {
        id_kategori: Number(id),
      },
    });

    if (!kategori) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Kategori dengan ID: ${id} tidak ditemukan`,
        },
      });
    }

    await prisma.kategori.delete({
      where: {
        id_kategori: Number(id),
      },
    });

    if (kategori.gambar_kategori) {
      const imagePath = kategori.gambar_kategori;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); 
      }
    }

    res.status(200).send({
      meta: {
        success: true,
        message: "Kategori berhasil dihapus",
      },
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Kesalahan internal server",
      },
      data: error,
    });
  }
};

const getAllKategori = async (req, res) => {
  try {
    const kategori = await prisma.kategori.findMany({
      select: {
        id_kategori: true,
        nama_kategori: true,
        gambar_kategori: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        id_kategori: "desc",
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua kategori",
      },
      data: kategori,
    });
  } catch (error) {
    res.status(500).send({
      meta: {
        success: false,
        message: "Kesalahan internal server",
      },
      data: error,
    });
  }
};

module.exports = {
  findKategori,
  createKategori,
  findKategoriById,
  updateKategori,
  deleteKategori,
  getAllKategori,
};
