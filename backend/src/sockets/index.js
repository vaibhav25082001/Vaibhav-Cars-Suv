const { Server } = require("socket.io");
const { verifyAccessToken } = require("../utils/jwt.util");
const { prisma } = require("../config/db");
const registerTicketSocket = require("./ticket.socket");
const registerServiceSocket = require("./service.socket");
const registerChatSocket = require("./chat.socket");
const registerNotificationSocket = require("./notification.socket");

async function authenticateSocket(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      const error = new Error("Authentication token missing");
      error.data = { statusCode: 401 };
      return next(error);
    }

    const payload = verifyAccessToken(token);
    const id = payload.id || payload.sub;
    const type = payload.type || (payload.role ? "employee" : "customer");
    const model = type === "customer" ? "customer" : "employee";
    const user = await prisma[model].findUnique({ where: { id } });

    if (!user || user.isActive === false) {
      const error = new Error("Invalid authentication token");
      error.data = { statusCode: 401 };
      return next(error);
    }

    socket.user = user;
    socket.auth = payload;
    socket.userType = type === "customer" ? "Customer" : "Employee";
    return next();
  } catch (error) {
    error.data = { statusCode: 401 };
    return next(error);
  }
}

function registerCommonRooms(socket) {
  socket.join(`${socket.userType}:${socket.user.id}`);
  socket.join(socket.userType.toLowerCase());

  socket.on("join", (room) => {
    if (typeof room === "string" && room.trim()) socket.join(room.trim());
  });

  socket.on("leave", (room) => {
    if (typeof room === "string" && room.trim()) socket.leave(room.trim());
  });
}

function initSockets(server, options = {}) {
  const io =
    options.io ||
    new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      },
    });

  io.use(authenticateSocket);
  io.on("connection", (socket) => {
    registerCommonRooms(socket);
    socket.emit("connected", {
      socketId: socket.id,
      userId: socket.user.id,
      userType: socket.userType,
      timestamp: new Date().toISOString(),
    });

    registerTicketSocket(io, socket);
    registerServiceSocket(io, socket);
    registerChatSocket(io, socket);
    registerNotificationSocket(io, socket);

    socket.on("disconnect", (reason) => {
      io.to("socket-monitor").emit("socket:disconnected", {
        socketId: socket.id,
        userId: socket.user.id,
        reason,
        timestamp: new Date().toISOString(),
      });
    });
  });

  return io;
}

module.exports = {
  initSockets,
  authenticateSocket,
};
