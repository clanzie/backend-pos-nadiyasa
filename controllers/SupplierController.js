const express = require("express");
const prisma = require("../prisma/client");

const findSupplier = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const supplier = await prisma.supplier.findMany({
      where: {
        nama_supplier: {
          contains: search,
        },
      },
      select: {
        id_supplier: true,
        nama_supplier: true,
        alamat_supplier: true,
        no_telp_supplier: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        id_supplier: "desc",
      },
      skip: skip,
      take: limit,
    });

    const totalSupplier = await prisma.supplier.count({
      where: {
        nama_supplier: {
          contains: search,
        },
      },
    });

    const totalPages = Math.ceil(totalSupplier / limit);

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua supplier",
      },
      data: supplier,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalSupplier,
      },
    });
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

const createSupplier = async (req, res) => {
  try {
    const supplier = await prisma.supplier.create({
      data: {
        nama_supplier: req.body.nama_supplier,
        alamat_supplier: req.body.alamat_supplier,
        no_telp_supplier: req.body.no_telp_supplier,
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil menambahkan supplier",
      },
      data: supplier,
    });
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

const findSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({
      where: {
        id_supplier: Number(id),
      },
      select: {
        id_supplier: true,
        nama_supplier: true,
        alamat_supplier: true,
        no_telp_supplier: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!supplier) {
      return res.status(404).send({
        meta: {
          success: false,
          message: "Supplier tidak ditemukan",
        },
      });
    }
    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan supplier",
      },
      data: supplier,
    });
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

const updateSupplier = async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await prisma.supplier.update({
      where: {
        id_supplier: Number(id),
      },
      data: {
        nama_supplier: req.body.nama_supplier,
        alamat_supplier: req.body.alamat_supplier,
        no_telp_supplier: req.body.no_telp_supplier,
        updated_at: new Date(),
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mengupdate supplier",
      },
      data: supplier,
    });
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

const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  try {
    const supplier = await prisma.supplier.findUnique({
      where: {
        id_supplier: Number(id),
      },
    });

    if (!supplier) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Supplier dengan id ${id} tidak ditemukan`,
        },
      });
    }

    await prisma.supplier.delete({
      where: {
        id_supplier: Number(id),
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil menghapus supplier",
      },
      data: supplier,
    });
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

const getAllSupplier = async (req, res) => {
  try {
    const supplier = await prisma.supplier.findMany({
      select: {
        id_supplier: true,
        nama_supplier: true,
      },
      orderBy: {
        id_supplier: "desc",
      },
    });

    const formattedSupplier = supplier.map((item) => ({
      value: item.id_supplier,
      label: item.nama_supplier,
    }));

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua supplier",
      },
      data: formattedSupplier,
    });
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
  findSupplier,
  createSupplier,
  findSupplierById,
  updateSupplier,
  deleteSupplier,
  getAllSupplier,
};
