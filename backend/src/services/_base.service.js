const { Prisma } = require("@prisma/client");
const { prisma } = require("../config/db");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function appError(message, statusCode = 400, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) error.details = details;
  return error;
}

function parsePagination(query = {}) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || DEFAULT_LIMIT), 1), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

function meta(page, limit, total) {
  return { page, limit, total, pages: Math.ceil(total / limit) || 0 };
}

function cleanObject(data = {}) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

function toBoolean(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

function toDate(value, field) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw appError(`${field} must be a valid date`);
  return date;
}

function toNumber(value, field) {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  if (Number.isNaN(number)) throw appError(`${field} must be a valid number`);
  return number;
}

function normalizeValue(value, type, field) {
  if (value === undefined) return undefined;
  if (type === "boolean") return toBoolean(value);
  if (type === "date") return toDate(value, field);
  if (type === "number") return toNumber(value, field);
  return value;
}

function buildWhere(query = {}, config = {}) {
  const where = {};
  const filters = config.filters || {};

  for (const [field, options] of Object.entries(filters)) {
    const raw = query[field];
    if (raw === undefined || raw === "") continue;
    const settings = typeof options === "string" ? { type: options } : options;
    const value = normalizeValue(raw, settings.type, field);
    if (settings.mode === "contains") {
      where[field] = { contains: value, mode: "insensitive" };
    } else if (settings.mode === "gte") {
      where[field] = { ...(where[field] || {}), gte: value };
    } else if (settings.mode === "lte") {
      where[field] = { ...(where[field] || {}), lte: value };
    } else {
      where[field] = value;
    }
  }

  if (query.from && config.dateField) {
    where[config.dateField] = {
      ...(where[config.dateField] || {}),
      gte: toDate(query.from, "from"),
    };
  }

  if (query.to && config.dateField) {
    where[config.dateField] = {
      ...(where[config.dateField] || {}),
      lte: toDate(query.to, "to"),
    };
  }

  if (query.search && config.searchFields?.length) {
    where.OR = config.searchFields.map((field) => ({
      [field]: { contains: query.search, mode: "insensitive" },
    }));
  }

  return where;
}

function buildOrderBy(query = {}, config = {}) {
  const defaultSort = config.defaultSort || { createdAt: "desc" };
  if (!query.sortBy) return defaultSort;

  const allowed = config.sortFields || [];
  if (!allowed.includes(query.sortBy)) {
    throw appError(`Sorting by ${query.sortBy} is not allowed`);
  }

  const sortOrder = String(query.sortOrder || "asc").toLowerCase();
  if (!["asc", "desc"].includes(sortOrder)) {
    throw appError("sortOrder must be asc or desc");
  }

  return { [query.sortBy]: sortOrder };
}

function requireFields(data = {}, fields = []) {
  const missing = fields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length) {
    throw appError(`Missing required field(s): ${missing.join(", ")}`, 422);
  }
}

function serializePrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw appError(`Unique constraint failed: ${(error.meta?.target || []).join(", ")}`, 409);
    }
    if (error.code === "P2025") {
      throw appError("Record not found", 404);
    }
    if (error.code === "P2003") {
      throw appError("Related record does not exist", 409);
    }
  }
  throw error;
}

async function withPrismaErrors(operation) {
  try {
    return await operation();
  } catch (error) {
    serializePrismaError(error);
  }
}

function createCrudService(modelName, config = {}) {
  const model = prisma[modelName];
  if (!model) throw new Error(`Unknown Prisma model: ${modelName}`);

  return {
    async list(query = {}) {
      return withPrismaErrors(async () => {
        const { page, limit, skip, take } = parsePagination(query);
        const where = buildWhere(query, config);
        const orderBy = buildOrderBy(query, config);
        const [data, total] = await Promise.all([
          model.findMany({ where, skip, take, orderBy, include: config.include }),
          model.count({ where }),
        ]);
        return { data, meta: meta(page, limit, total) };
      });
    },

    async getById(id, include = config.include) {
      return withPrismaErrors(async () => {
        if (!id) throw appError("id is required", 422);
        const data = await model.findUnique({ where: { id }, include });
        if (!data) throw appError("Record not found", 404);
        return data;
      });
    },

    async create(data) {
      return withPrismaErrors(async () => {
        requireFields(data, config.requiredCreate);
        return model.create({ data: cleanObject(config.mapCreate ? config.mapCreate(data) : data) });
      });
    },

    async update(id, data) {
      return withPrismaErrors(async () => {
        if (!id) throw appError("id is required", 422);
        return model.update({
          where: { id },
          data: cleanObject(config.mapUpdate ? config.mapUpdate(data) : data),
        });
      });
    },

    async remove(id, hardDelete = false) {
      return withPrismaErrors(async () => {
        if (!id) throw appError("id is required", 422);
        if (!hardDelete && config.softDeleteField) {
          return model.update({ where: { id }, data: { [config.softDeleteField]: false } });
        }
        return model.delete({ where: { id } });
      });
    },
  };
}

module.exports = {
  appError,
  buildOrderBy,
  buildWhere,
  cleanObject,
  createCrudService,
  meta,
  parsePagination,
  prisma,
  requireFields,
  toBoolean,
  toDate,
  toNumber,
  withPrismaErrors,
};
