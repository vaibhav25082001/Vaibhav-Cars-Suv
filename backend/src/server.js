require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cron = require("node-cron");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

app.set("prisma", prisma);
app.set("io", io);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

io.on("connection", (socket) => {
  socket.emit("connected", {
    socketId: socket.id,
    timestamp: new Date().toISOString(),
  });

  socket.on("join", (room) => {
    if (typeof room === "string" && room.trim()) {
      socket.join(room.trim());
    }
  });

  socket.on("leave", (room) => {
    if (typeof room === "string" && room.trim()) {
      socket.leave(room.trim());
    }
  });
});

async function logPipelineRun(pipelineName, runner) {
  const startedAt = new Date();

  try {
    const recordsProcessed = await runner();

    await prisma.pipelineLog.create({
      data: {
        pipelineName,
        status: "Success",
        recordsProcessed: recordsProcessed || 0,
        startedAt,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.pipelineLog.create({
      data: {
        pipelineName,
        status: "Failed",
        recordsProcessed: 0,
        startedAt,
        completedAt: new Date(),
        errorMsg: error.message,
      },
    });

    console.error(`[cron:${pipelineName}]`, error);
  }
}

function startCronPipelines() {
  cron.schedule("0 1 * * *", () =>
    logPipelineRun("daily-sales-summary", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const showrooms = await prisma.showroom.findMany({
        select: { id: true },
      });

      for (const showroom of showrooms) {
        const [carsSold, revenue, testDrives, newLeads] = await Promise.all([
          prisma.purchase.count({
            where: { showroomId: showroom.id, purchaseDate: { gte: today } },
          }),
          prisma.purchase.aggregate({
            where: { showroomId: showroom.id, purchaseDate: { gte: today } },
            _sum: { totalAmount: true },
          }),
          prisma.testDriveBooking.count({
            where: { showroomId: showroom.id, bookingDate: { gte: today } },
          }),
          prisma.lead.count({
            where: { createdAt: { gte: today } },
          }),
        ]);

        await prisma.dailySalesSummary.upsert({
          where: {
            date_showroomId: {
              date: today,
              showroomId: showroom.id,
            },
          },
          update: {
            carsSold,
            revenue: revenue._sum.totalAmount || 0,
            testDrives,
            newLeads,
          },
          create: {
            date: today,
            showroomId: showroom.id,
            carsSold,
            revenue: revenue._sum.totalAmount || 0,
            testDrives,
            newLeads,
          },
        });
      }

      return showrooms.length;
    })
  );

  cron.schedule("15 1 1 * *", () =>
    logPipelineRun("monthly-revenue-summary", async () => {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const monthStart = new Date(year, now.getMonth(), 1);
      const nextMonthStart = new Date(year, now.getMonth() + 1, 1);

      const showrooms = await prisma.showroom.findMany({
        select: { id: true },
      });

      for (const showroom of showrooms) {
        const [purchases, expenses, newCustomers] = await Promise.all([
          prisma.purchase.aggregate({
            where: {
              showroomId: showroom.id,
              purchaseDate: { gte: monthStart, lt: nextMonthStart },
            },
            _count: { id: true },
            _sum: { totalAmount: true },
            _avg: { totalAmount: true },
          }),
          prisma.expense.aggregate({
            where: { showroomId: showroom.id, month, year },
            _sum: { amount: true },
          }),
          prisma.customer.count({
            where: { createdAt: { gte: monthStart, lt: nextMonthStart } },
          }),
        ]);

        const totalRevenue = purchases._sum.totalAmount || 0;
        const totalExpenses = expenses._sum.amount || 0;

        await prisma.monthlyRevenueSummary.upsert({
          where: {
            month_year_showroomId: {
              month,
              year,
              showroomId: showroom.id,
            },
          },
          update: {
            totalRevenue,
            totalExpenses,
            grossProfit: Number(totalRevenue) - Number(totalExpenses),
            carsSold: purchases._count.id,
            newCustomers,
            avgDealSize: purchases._avg.totalAmount || 0,
          },
          create: {
            month,
            year,
            showroomId: showroom.id,
            totalRevenue,
            totalExpenses,
            grossProfit: Number(totalRevenue) - Number(totalExpenses),
            carsSold: purchases._count.id,
            newCustomers,
            avgDealSize: purchases._avg.totalAmount || 0,
          },
        });
      }

      return showrooms.length;
    })
  );
}

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
  });
});

async function startServer() {
  try {
    await prisma.$connect();
    startCronPipelines();

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
