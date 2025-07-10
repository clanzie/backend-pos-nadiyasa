const express = require("express");
const prisma = require("../prisma/client");

const findKeranjang = async (req, res) => {
  try {
    const keranjang = await prisma.keranjang.findMany({
      select: {
        id_keranjang: true,
        id_produk: true,
        id_user: true,
        jumlah: true,
        harga: true,
        created_at: true,
        updated_at: true,
        produk: {
          select: {
            id_produk: true,
            nama_produk: true,
            satuan: true,
            harga_beli: true,
            harga_jual: true,
            gambar_produk: true,
            stok_produk: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      where: {
        id_user: parseInt(req.userId),
      },
      orderBy: {
        id_keranjang: "desc",
      },
    });

    const totalHarga = keranjang.reduce((sum, cart) => sum + cart.harga, 0);

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan semua keranjang oleh kasir: ${req.userId}`,
      },
      data: keranjang,
      totalHarga: totalHarga,
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

const createKeranjang = async (req, res) => {
  try {
    const produk = await prisma.produk.findUnique({
      where: {
        id_produk: parseInt(req.body.id_produk),
      },
    });

    if (!produk) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Produk dengan id ${req.body.id_produk} tidak ditemukan`,
        },
      });
    }

    const existingKeranjang = await prisma.keranjang.findFirst({
      where: {
        id_produk: parseInt(req.body.id_produk),
        id_user: req.userId,
      },
    });

    if (existingKeranjang) {
      const updatedKeranjang = await prisma.keranjang.update({
        where: {
          id_keranjang: existingKeranjang.id_keranjang,
        },
        data: {
          jumlah: existingKeranjang.jumlah + parseInt(req.body.jumlah),
          harga:
            (existingKeranjang.jumlah + parseInt(req.body.jumlah)) *
            produk.harga_jual,
          updated_at: new Date(),
        },
        include: {
          produk: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      res.status(200).send({
        meta: {
          success: true,
          message: `Berhasil memperbarui keranjang`,
        },
        data: updatedKeranjang,
      });
    } else {
      const keranjang = await prisma.keranjang.create({
        data: {
          id_produk: parseInt(req.body.id_produk),
          id_user: req.userId,
          jumlah: parseInt(req.body.jumlah),
          harga: parseInt(req.body.jumlah) * produk.harga_jual,
        },
        include: {
          produk: true,
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return res.status(201).send({
        meta: {
          success: true,
          message: `Keranjang berhasil dibuat`,
        },
        data: keranjang,
      });
    }
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

const deleteKeranjang = async (req, res) => {
  const { id } = req.params;
  try {
    const keranjang = await prisma.keranjang.findUnique({
      where: {
        id_keranjang: Number(id),
        id_user: parseInt(req.userId),
      },
    });

    if (!keranjang) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Keranjang dengan id ${id} tidak ditemukan`,
        },
      });
    }

    await prisma.keranjang.delete({
      where: {
        id_keranjang: Number(id),
        id_user: parseInt(req.userId),
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil menghapus produk dari keranjang`,
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
}

module.exports = { findKeranjang, createKeranjang, deleteKeranjang };
