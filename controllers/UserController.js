const express = require("express");
const prisma = require("../prisma/client");
const bcrypt = require("bcryptjs");

//Fungsi find user
const findUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const users = await prisma.users.findMany({
      where: {
        username: {
          contains: search,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        id_role: true,
        role: {
          select: {
            nama_role: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      skip: skip,
      take: limit,
    });

    const totalUsers = await prisma.users.count({
      where: {
        username: {
          contains: search,
        },
      },
    });

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).send({
      meta: {
        success: true,
        message: "Berhasil mendapatkan semua pengguna",
      },
      data: users,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        perPage: limit,
        total: totalUsers,
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

const createUser = async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const { username, email, id_role } = req.body;

  try {
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return res.status(409).send({
        meta: {
          success: false,
          message: "Username atau email sudah digunakan",
        },
      });
    }

    const user = await prisma.users.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
        id_role: Number(id_role)
      },
    });

    res.status(201).send({
      meta: {
        success: true,
        message: "Pengguna berhasil dibuat",
      },
      data: user,
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


const findUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.users.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        username: true,
        email: true,
        id_role: true,
        role: {
          select: {
            nama_role: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).send({
        meta: {
          success: false,
          message: `Pengguna dengan ID: ${id} tidak ditemukan`,
        },
      });
    }

    res.status(200).send({
      meta: {
        success: true,
        message: `Berhasil mendapatkan pengguna dengan ID: ${id}`,
      },
      data: user,
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

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, id_role } = req.body;

  let userData = {
    username: username,
    email: email,
    updated_at: new Date(),
    id_role: Number(id_role)
  };

  try {
    if (password && password !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
    }

    const user = await prisma.users.update({
      where: {
        id: Number(id),
      },
      data: userData,
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Data pengguna berhasil diupdate",
      },
      data: user,
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

// Fungsi delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {

    await prisma.users.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).send({
      meta: {
        success: true,
        message: "Pengguna berhasil dihapus",
      },
      data: null,
    })
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
  findUsers,
  createUser,
  findUserById,
  updateUser,
  deleteUser,
};
