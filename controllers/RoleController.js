const prisma = require("../prisma/client");

const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id_role: true,
        nama_role: true,
      },
      orderBy: { id_role: "asc" }
    });
    res.status(200).json({
      meta: { success: true, message: "Berhasil mendapatkan semua role" },
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      meta: { success: false, message: "Terjadi kesalahan pada server" },
      data: error,
    });
  }
};

const createRole = async (req, res) => {
  try {
    const { nama_role } = req.body;
    const role = await prisma.role.create({
      data: { nama_role },
    });
    res.status(201).json({
      meta: { success: true, message: "Role berhasil dibuat" },
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      meta: { success: false, message: "Terjadi kesalahan pada server" },
      data: error,
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({
      where: { id_role: Number(id) },
    });
    res.status(200).json({
      meta: { success: true, message: "Role berhasil dihapus" },
    });
  } catch (error) {
    res.status(500).json({
      meta: { success: false, message: "Terjadi kesalahan pada server" },
      data: error,
    });
  }
};

module.exports = {
  getAllRoles,
  createRole,
  deleteRole,
};