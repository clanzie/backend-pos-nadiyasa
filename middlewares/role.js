const prisma = require("../prisma/client");

const authorizeRole = (roles) => {
  return async (req, res, next) => {
    const user = await prisma.users.findUnique({
      where: { id: req.userId },
      select: { role: { select: { nama_role: true } } },
    });
    if (!user) return res.status(403).json({ message: "Akses ditolak" });

    // Izinkan owner akses semua
    if (user.role.nama_role === "owner") {
      return next();
    }

    if (!roles.includes(user.role.nama_role)) {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    next();
  };
};

module.exports = authorizeRole;