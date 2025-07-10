const prisma = require("../client");
const bcrypt = require("bcryptjs");

async function main() {
  const password = await bcrypt.hash("password", 10); // hash password user

  // Create user
  await prisma.users.create({
    data: {
      username: "owner",
      email: "owner@gmail.com",
      password,
      id_role: 1,
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
