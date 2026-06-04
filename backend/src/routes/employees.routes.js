const express = require("express");
const bcrypt = require("bcrypt");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { asyncHandler, getPagination, paginationMeta, parseDate, sendCreated } = require("./_helpers");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {
      ...(req.query.role && { role: req.query.role }),
      ...(req.query.department && {
        department: { contains: req.query.department, mode: "insensitive" },
      }),
      ...(req.query.showroomId && { showroomId: req.query.showroomId }),
      ...(req.query.isActive !== undefined && { isActive: req.query.isActive === "true" }),
    };

    const [data, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { showroom: true, targets: true, attendance: true, leaveBalances: true },
      }),
      prisma.employee.count({ where }),
    ]);

    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        showroom: true,
        targets: true,
        attendance: true,
        leaveRequests: true,
        approvedLeaveRequests: true,
        leaveBalances: true,
        assignedLeads: true,
      },
    });

    if (!data) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ data });
  })
);

router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const passwordHash = await bcrypt.hash(req.body.password || "Password@123", 10);
    const data = await prisma.employee.create({
      data: {
        ...req.body,
        password: undefined,
        passwordHash,
        joiningDate: parseDate(req.body.joiningDate),
      },
    });
    sendCreated(res, data);
  })
);

router.put(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.employee.update({
      where: { id: req.params.id },
      data: { ...req.body, joiningDate: parseDate(req.body.joiningDate) },
    });
    res.json({ data });
  })
);

router.post(
  "/:id/attendance",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: req.params.id,
          date: parseDate(req.body.date),
        },
      },
      update: {
        checkIn: parseDate(req.body.checkIn),
        checkOut: parseDate(req.body.checkOut),
        status: req.body.status,
      },
      create: {
        employeeId: req.params.id,
        date: parseDate(req.body.date),
        checkIn: parseDate(req.body.checkIn),
        checkOut: parseDate(req.body.checkOut),
        status: req.body.status,
      },
    });
    sendCreated(res, data);
  })
);

router.post(
  "/:id/leave-requests",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.leaveRequest.create({
      data: {
        ...req.body,
        employeeId: req.params.id,
        startDate: parseDate(req.body.startDate),
        endDate: parseDate(req.body.endDate),
      },
    });
    sendCreated(res, data);
  })
);

module.exports = router;
