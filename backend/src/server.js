require("dotenv").config();

const http = require("http");
const { PrismaClient } = require("@prisma/client");
const app = require("./app");
const { initSockets } = require("./sockets");
const { startPipelines } = require("./pipelines");

const prisma = new PrismaClient();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = initSockets(server);

app.set("prisma", prisma);
app.set("io", io);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected");

    startPipelines();
    console.log("Cron pipelines started");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
