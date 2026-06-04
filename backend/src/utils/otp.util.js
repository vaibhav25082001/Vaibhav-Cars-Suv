const crypto = require("crypto");

function generateOtp(length = 6) {
  if (!Number.isInteger(length) || length < 4 || length > 10) {
    throw new Error("OTP length must be an integer between 4 and 10");
  }

  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  return String(crypto.randomInt(min, max + 1));
}

function generateAlphaNumericOtp(length = 8) {
  if (!Number.isInteger(length) || length < 4 || length > 32) {
    throw new Error("OTP length must be an integer between 4 and 32");
  }

  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let otp = "";

  for (let index = 0; index < length; index += 1) {
    otp += alphabet[crypto.randomInt(0, alphabet.length)];
  }

  return otp;
}

function hashOtp(otp, secret = process.env.OTP_SECRET || "vaibhav-cars-otp") {
  return crypto.createHmac("sha256", secret).update(String(otp)).digest("hex");
}

function verifyOtp(otp, hash, secret) {
  const expectedHash = hashOtp(otp, secret);

  return crypto.timingSafeEqual(
    Buffer.from(expectedHash, "hex"),
    Buffer.from(hash, "hex")
  );
}

function getOtpExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function isOtpExpired(expiresAt) {
  return !expiresAt || new Date(expiresAt).getTime() < Date.now();
}

module.exports = {
  generateOtp,
  generateAlphaNumericOtp,
  hashOtp,
  verifyOtp,
  getOtpExpiry,
  isOtpExpired,
};
