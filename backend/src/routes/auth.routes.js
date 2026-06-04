const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  generateTokenPair,
  verifyRefreshToken,
} = require("../utils/jwt.util");
const { asyncHandler, sendCreated } = require("./_helpers");

const router = express.Router();

function publicUser(user, type) {
  const { passwordHash, ...safeUser } = user;
  return { ...safeUser, authType: type };
}

async function loginUser(model, email, password, type) {
  const user = await prisma[model].findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.isActive === false) {
    const error = new Error("Account is disabled");
    error.statusCode = 403;
    throw error;
  }

  const safeUser = publicUser(user, type);

  return {
    user: safeUser,
    ...generateTokenPair(safeUser),
  };
}

router.post(
  "/customer/register",
  asyncHandler(async (req, res) => {
    const { name, email, phone, city, password, referralCode, referredById } =
      req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        city,
        passwordHash,
        referralCode:
          referralCode || `${name.slice(0, 4).toUpperCase()}${Date.now()}`,
        referredById,
      },
    });

    const user = publicUser(customer, "customer");
    return sendCreated(res, {
      user,
      ...generateTokenPair(user),
    });
  })
);

router.post(
  "/customer/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await loginUser("customer", email, password, "customer");

    await prisma.customer.update({
      where: { id: result.user.id },
      data: { lastLogin: new Date() },
    });

    res.json(result);
  })
);

router.post(
  "/employee/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    res.json(await loginUser("employee", email, password, "employee"));
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.body.refreshToken || req.headers["x-refresh-token"];

    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const payload = verifyRefreshToken(token);
    const accessToken = jwt.sign(
      {
        id: payload.id,
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        type: payload.type,
      },
      env.jwtSecret,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "15m",
        issuer: "vaibhav-cars",
        audience: "vaibhav-cars-api",
      }
    );

    res.json({ accessToken });
  })
);

router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user, req.userType) });
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
