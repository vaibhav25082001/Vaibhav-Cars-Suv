const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

const routeDefinitions = [
  ["auth", "/api/auth"],
  ["cars", "/api/cars"],
  ["inventory", "/api/inventory"],
  ["bookings", "/api/bookings"],
  ["purchases", "/api/purchases"],
  ["customers", "/api/customers"],
  ["employees", "/api/employees"],
  ["support", "/api/support"],
  ["admin", "/api/admin"],
  ["analytics", "/api/analytics"],
  ["documents", "/api/documents"],
  ["careers", "/api/careers"],
  ["ai", "/api/ai"],
  ["offers", "/api/offers"],
  ["notifications", "/api/notifications"],
];

function registerRoutes() {
  for (const [routeName, mountPath] of routeDefinitions) {
    try {
      app.use(mountPath, require(`./routes/${routeName}.routes`));
    } catch (error) {
      if (error.code !== "MODULE_NOT_FOUND") {
        throw error;
      }
    }
  }
}

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", async (req, res, next) => {
  try {
    const prisma = req.app.get("prisma");

    if (prisma) {
      await prisma.$queryRaw`SELECT 1`;
    }

    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

registerRoutes();

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

module.exports = app;
