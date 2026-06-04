const bcrypt = require("bcrypt");
const {
  createCrudService,
  prisma,
  requireFields,
  toDate,
  withPrismaErrors,
} = require("./_base.service");

const employees = createCrudService("employee", {
  filters: { role: "string", department: "string", showroomId: "string", isActive: "boolean" },
  searchFields: ["name", "email", "phone", "employeeCode", "department"],
  sortFields: ["name", "email", "employeeCode", "joiningDate", "salary", "performanceScore", "createdAt"],
  requiredCreate: ["name", "email", "phone", "employeeCode", "role", "department", "salary", "joiningDate", "passwordHash"],
  mapCreate: (data) => ({ ...data, joiningDate: toDate(data.joiningDate, "joiningDate") }),
  mapUpdate: (data) => ({ ...data, joiningDate: toDate(data.joiningDate, "joiningDate") }),
  include: { showroom: true, targets: true, leaveBalances: true },
  softDeleteField: "isActive",
});

const targets = createCrudService("employeeTarget", {
  filters: { employeeId: "string", month: "number", year: "number" },
  sortFields: ["month", "year", "salesTarget", "revenueTarget", "salesAchieved", "revenueAchieved", "commissionEarned"],
  requiredCreate: ["employeeId", "month", "year", "salesTarget", "revenueTarget"],
  include: { employee: true },
});

const attendance = createCrudService("attendance", {
  filters: { employeeId: "string", status: "string" },
  sortFields: ["date", "checkIn", "checkOut", "status", "createdAt"],
  dateField: "date",
  requiredCreate: ["employeeId", "date", "status"],
  mapCreate: (data) => ({ ...data, date: toDate(data.date, "date"), checkIn: toDate(data.checkIn, "checkIn"), checkOut: toDate(data.checkOut, "checkOut") }),
  mapUpdate: (data) => ({ ...data, date: toDate(data.date, "date"), checkIn: toDate(data.checkIn, "checkIn"), checkOut: toDate(data.checkOut, "checkOut") }),
  include: { employee: true },
});

const leaveRequests = createCrudService("leaveRequest", {
  filters: { employeeId: "string", leaveType: "string", status: "string", approvedById: "string" },
  searchFields: ["reason"],
  sortFields: ["startDate", "endDate", "createdAt", "status"],
  dateField: "startDate",
  requiredCreate: ["employeeId", "leaveType", "startDate", "endDate", "reason"],
  mapCreate: (data) => ({ ...data, startDate: toDate(data.startDate, "startDate"), endDate: toDate(data.endDate, "endDate") }),
  mapUpdate: (data) => ({ ...data, startDate: toDate(data.startDate, "startDate"), endDate: toDate(data.endDate, "endDate") }),
  include: { employee: true, approvedBy: true },
});

const leaveBalances = createCrudService("leaveBalance", {
  filters: { employeeId: "string", year: "number" },
  sortFields: ["year", "earnedTotal", "earnedUsed", "sickTotal", "sickUsed", "casualTotal", "casualUsed"],
  requiredCreate: ["employeeId", "year", "earnedTotal", "sickTotal", "casualTotal"],
  include: { employee: true },
});

async function createEmployee(data) {
  requireFields(data, ["name", "email", "phone", "employeeCode", "role", "department", "salary", "joiningDate", "password"]);
  return withPrismaErrors(async () => {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.employee.create({
      data: {
        ...data,
        password: undefined,
        passwordHash,
        joiningDate: toDate(data.joiningDate, "joiningDate"),
      },
    });
  });
}

async function approveLeave(id, approvedById) {
  requireFields({ id, approvedById }, ["id", "approvedById"]);
  return withPrismaErrors(() =>
    prisma.leaveRequest.update({
      where: { id },
      data: { status: "Approved", approvedById },
      include: { employee: true, approvedBy: true },
    })
  );
}

module.exports = {
  ...employees,
  employees,
  targets,
  attendance,
  leaveRequests,
  leaveBalances,
  createEmployee,
  approveLeave,
};
