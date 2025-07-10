const express = require("express");
const jwt = require("jsonwebtoken");

// Middleware untuk memverifikasi token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ message: "Tidak terautentikasi." });

  // Verifikasi token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // Jika token tidak valid, kirimkan respons token tidak valid
    if (err) return res.status(401).json({ message: "Token tidak valid" });

    // Jika token valid, simpan ID pengguna dari token ke request
    req.userId = decoded.id;

    next();
  });
};

// Mengekspor middleware verifyToken agar dapat digunakan di tempat lain
module.exports = verifyToken;
