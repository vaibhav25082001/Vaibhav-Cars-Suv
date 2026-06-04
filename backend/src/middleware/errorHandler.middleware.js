const multer = require("multer");
const env = require("../config/env");

function notFoundHandler(req, res) {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: "File upload error",
      code: error.code,
      field: error.field,
    });
  }

  const statusCode = error.statusCode || error.status || 500;

  return res.status(statusCode).json({
    message: error.message || "Internal server error",
    ...(error.errors && { errors: error.errors }),
    ...(env.nodeEnv !== "production" && { stack: error.stack }),
  });
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
