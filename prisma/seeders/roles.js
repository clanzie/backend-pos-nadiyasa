const prisma = require("../client");

async function main() {
  await prisma.role.createMany({
    data: [
      { nama_role: "owner" },
      { nama_role: "admin" },
      { nama_role: "kasir" },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });