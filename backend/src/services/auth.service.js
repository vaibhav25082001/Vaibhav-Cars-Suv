const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { generateTokenPair, verifyRefreshToken } = require("../utils/jwt.util");
const {
  appError,
  createCrudService,
  prisma,
  requireFields,
  withPrismaErrors,
} = require("./_base.service");

const customerCrud = createCrudService("customer", {
  filters: { city: "string", tag: "string" },
  searchFields: ["name", "email", "phone", "city"],
  sortFields: ["name", "email", "city", "createdAt", "lastLogin"],
  requiredCreate: ["name", "email", "phone", "city", "passwordHash", "referralCode"],
  softDeleteField: null,
});

const employeeCrud = createCrudService("employee", {
  filters: { role: "string", department: "string", showroomId: "string", isActive: "boolean" },
  searchFields: ["name", "email", "phone", "employeeCode", "department"],
  sortFields: ["name", "email", "employeeCode", "joiningDate", "createdAt", "performanceScore"],
  requiredCreate: ["name", "email", "phone", "employeeCode", "role", "department", "salary", "joiningDate", "passwordHash"],
  softDeleteField: "isActive",
});

function publicUser(user, authType) {
  const { passwordHash, ...safeUser } = user;
  return { ...safeUser, authType };
}

async function login(modelName, email, password, authType) {
  requireFields({ email, password }, ["email", "password"]);
  return withPrismaErrors(async () => {
    const user = await prisma[modelName].findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw appError("Invalid email or password", 401);
    }
    if (user.isActive === false) throw appError("Account is disabled", 403);

    const safeUser = publicUser(user, authType);
    return { user: safeUser, ...generateTokenPair(safeUser) };
  });
}

async function registerCustomer(payload) {
  requireFields(payload, ["name", "email", "phone", "city", "password"]);
  return withPrismaErrors(async () => {
    const passwordHash = await bcrypt.hash(payload.password, 12);
    const referralCode =
      payload.referralCode ||
      `${payload.name.replace(/\s+/g, "").slice(0, 4).toUpperCase()}${Date.now()}`;

    const customer = await prisma.customer.create({
      data: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        city: payload.city,
        passwordHash,
        referralCode,
        referredById: payload.referredById,
      },
    });

    const user = publicUser(customer, "customer");
    return { user, ...generateTokenPair(user) };
  });
}

async function loginCustomer(email, password) {
  const result = await login("customer", email, password, "customer");
  await prisma.customer.update({
    where: { id: result.user.id },
    data: { lastLogin: new Date() },
  });
  return result;
}

async function loginEmployee(email, password) {
  return login("employee", email, password, "employee");
}

function refreshAccessToken(refreshToken) {
  if (!refreshToken) throw appError("Refresh token missing", 401);
  const payload = verifyRefreshToken(refreshToken);
  return {
    accessToken: jwt.sign(
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
    ),
  };
}

async function changePassword(authType, id, currentPassword, nextPassword) {
  requireFields({ id, currentPassword, nextPassword }, ["id", "currentPassword", "nextPassword"]);
  const modelName = authType === "employee" ? "employee" : "customer";
  return withPrismaErrors(async () => {
    const user = await prisma[modelName].findUnique({ where: { id } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw appError("Current password is incorrect", 401);
    }
    const passwordHash = await bcrypt.hash(nextPassword, 12);
    const updated = await prisma[modelName].update({ where: { id }, data: { passwordHash } });
    return publicUser(updated, authType);
  });
}

module.exports = {
  ...customerCrud,
  customers: customerCrud,
  employees: employeeCrud,
  publicUser,
  registerCustomer,
  loginCustomer,
  loginEmployee,
  refreshAccessToken,
  changePassword,
};
