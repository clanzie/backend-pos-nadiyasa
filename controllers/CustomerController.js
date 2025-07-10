const express = require("express");
const prisma = require("../prisma/client");

const findCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const customer = await prisma.customer.findMany({
      where: {
        nama_customer: {
          contains: search,
        },
      },
      select: {
        id_customer: true,
        nama_customer: true,
        alamat_customer: true,
        no_telp_customer: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        id_customer: "desc",
      },
      skip: skip,
      take: limit,
    });

    const totalCustomer = await prisma.customer.count({
      where: {
        nama_customer: {
          contains: search,
        },
      },
    });

    const totalPages = Math.ceil(totalCustomer / limit); 

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua customer",
      },
      data: customer,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalCustomer,
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

const createCustomer = async (req, res) => {
  try {
    const customer = await prisma.customer.create({
      data: {
        nama_customer: req.body.nama_customer,
        alamat_customer: req.body.alamat_customer,
        no_telp_customer: req.body.no_telp_customer,
      },
    });

    res.status(201).send({
      meta: {
        success: true,
        message: "Berhasil menambahkan customer",
      },
      data: customer,
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

const findCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: {
        id_customer: Number(id),
      },
      select: {
        id_customer: true,
        nama_customer: true,
        alamat_customer: true,
        no_telp_customer: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!customer) {
      return res.status(404).send({
        meta: {
          success: false,
          message: "Customer tidak ditemukan",
        },
      });
    }
    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan customer",
      },
      data: customer,
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

const updateCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await prisma.customer.update({
      where: {
        id_customer: Number(id),
      },
      data: {
        nama_customer: req.body.nama_customer,
        alamat_customer: req.body.alamat_customer,
        no_telp_customer: req.body.no_telp_customer,
        updated_at: new Date(),
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil memperbarui customer",
      },
      data: customer,
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

const deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id_customer: Number(id),
      },
    });

    if (!customer) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Customer dengan id ${id} tidak ditemukan`,
        },
      });
    }

    await prisma.customer.delete({
      where: {
        id_customer: Number(id),
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil menghapus customer",
      },
      data: customer,
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

const allCustomer = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id_customer: true,
        nama_customer: true,
        no_telp_customer: true,
      },
      orderBy: {
        id_customer: "desc",
      },
    });

    const formattedCustomers = customers.map((customer) => ({
      value: customer.id_customer,
      label: `${customer.nama_customer || "-"}${customer.no_telp_customer ? " - " + customer.no_telp_customer : ""}`,
    }));

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua customer",
      },
      data: formattedCustomers,
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

module.exports = {
  findCustomers,
  createCustomer,
  findCustomerById,
  updateCustomer,
  deleteCustomer,
  allCustomer,
};
