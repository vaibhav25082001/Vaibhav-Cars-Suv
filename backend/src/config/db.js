const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "production"
      ? ["error"]
      : ["query", "info", "warn", "error"],
});

async function connectDb() {
  await prisma.$connect();
  return prisma;
}

async function disconnectDb() {
  await prisma.$disconnect();
}

module.exports = {
  prisma,
  connectDb,
  disconnectDb,
};
