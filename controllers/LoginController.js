const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");


const login = async (req, res) => {
  try {

    const user = await prisma.users.findFirst({
      where: {
        username: req.body.username,
      },
      select: {
        id: true,
        id_role: true,
        username: true,
        email: true,
        password: true,
        role: {
          select: {
            nama_role: true,
          },
        },
      },
    });

    if (!user)
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword)
      return res.status(404).json({
        success: false,
        message: "Password tidak valid",
      });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const { password, ...userWithoutPassword } = user;

    res.status(200).send({
      meta: {
        success: true,
        message: "Login berhasil",
      },
      data: {
        user: userWithoutPassword,
        token: token,
      },
    });
  } catch (error) {

    res.status(500).send({
      meta: {
        success: false,
        message: "Terjadi kesalahan di server",
      },

      errors: error,
    });
  }
};

module.exports = { login };
