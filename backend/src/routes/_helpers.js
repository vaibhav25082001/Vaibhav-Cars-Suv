const { asyncHandler } = require("../middleware/errorHandler.middleware");

function getPagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
}

function paginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}

function omitUndefined(data) {
  return Object.fromEntries(
    Object.entries(data || {}).filter(([, value]) => value !== undefined)
  );
}

function parseDate(value) {
  return value ? new Date(value) : undefined;
}

function parseDecimal(value) {
  return value === undefined || value === null || value === "" ? undefined : value;
}

function sendCreated(res, data) {
  return res.status(201).json({ data });
}

module.exports = {
  asyncHandler,
  getPagination,
  paginationMeta,
  omitUndefined,
  parseDate,
  parseDecimal,
  sendCreated,
};
