const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { prisma } = require("../config/db");

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return req.cookies?.accessToken || req.cookies?.token || null;
}

async function findAuthenticatedUser(payload) {
  const id = payload.id || payload.sub || payload.userId;
  const type = payload.type || payload.userType || payload.roleType;

  if (!id) {
    return null;
  }

  if (type === "customer") {
    const customer = await prisma.customer.findUnique({ where: { id } });
    return customer ? { ...customer, authType: "customer" } : null;
  }

  if (type === "employee" || type === "admin") {
    const employee = await prisma.employee.findUnique({ where: { id } });
    return employee ? { ...employee, authType: "employee" } : null;
  }

  const [employee, customer] = await Promise.all([
    prisma.employee.findUnique({ where: { id } }),
    prisma.customer.findUnique({ where: { id } }),
  ]);

  if (employee) {
    return { ...employee, authType: "employee" };
  }

  if (customer) {
    return { ...customer, authType: "customer" };
  }

  return null;
}

async function authMiddleware(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await findAuthenticatedUser(payload);

    if (!user || user.isActive === false) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.auth = payload;
    req.user = user;
    req.userId = user.id;
    req.userType = user.authType;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Authentication token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    return next(error);
  }
}

function optionalAuthMiddleware(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return next();
  }

  return authMiddleware(req, res, next);
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  authenticate: authMiddleware,
  optionalAuth: optionalAuthMiddleware,
};
