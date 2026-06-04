const jwt = require("jsonwebtoken");
const env = require("../config/env");

const DEFAULT_ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const DEFAULT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

function signAccessToken(payload, options = {}) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: options.expiresIn || DEFAULT_ACCESS_EXPIRES_IN,
    issuer: options.issuer || "vaibhav-cars",
    audience: options.audience || "vaibhav-cars-api",
    ...options,
  });
}

function signRefreshToken(payload, options = {}) {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: options.expiresIn || DEFAULT_REFRESH_EXPIRES_IN,
    issuer: options.issuer || "vaibhav-cars",
    audience: options.audience || "vaibhav-cars-api",
    ...options,
  });
}

function generateTokenPair(user, extraPayload = {}) {
  const payload = {
    id: user.id,
    sub: user.id,
    email: user.email,
    role: user.role,
    type: user.authType || user.type || (user.role ? "employee" : "customer"),
    ...extraPayload,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

function verifyAccessToken(token, options = {}) {
  return jwt.verify(token, env.jwtSecret, {
    issuer: options.issuer || "vaibhav-cars",
    audience: options.audience || "vaibhav-cars-api",
    ...options,
  });
}

function verifyRefreshToken(token, options = {}) {
  return jwt.verify(token, env.jwtRefreshSecret, {
    issuer: options.issuer || "vaibhav-cars",
    audience: options.audience || "vaibhav-cars-api",
    ...options,
  });
}

function decodeToken(token) {
  return jwt.decode(token, { complete: true });
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
};
