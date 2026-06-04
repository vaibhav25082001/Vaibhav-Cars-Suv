const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const { asyncHandler, getPagination, paginationMeta, parseDate, sendCreated } = require("./_helpers");

const router = express.Router();
const adminOnly = [authMiddleware, roleMiddleware("Admin", "ShowroomManager")];

router.get(
  "/dashboard",
  adminOnly,
  asyncHandler(async (req, res) => {
    const [
      customers,
      employees,
      cars,
      purchases,
      revenue,
      openTickets,
      hotLeads,
      availableInventory,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.employee.count({ where: { isActive: true } }),
      prisma.carModel.count({ where: { isActive: true } }),
      prisma.purchase.count(),
      prisma.purchase.aggregate({ _sum: { totalAmount: true } }),
      prisma.supportTicket.count({ where: { status: { in: ["Open", "InProgress", "Escalated"] } } }),
      prisma.lead.count({ where: { priority: "Hot" } }),
      prisma.carInventory.count({ where: { status: "Available" } }),
    ]);

    res.json({
      data: {
        customers,
        employees,
        cars,
        purchases,
        totalRevenue: revenue._sum.totalAmount || 0,
        openTickets,
        hotLeads,
        availableInventory,
      },
    });
  })
);

router.get(
  "/showrooms",
  adminOnly,
  asyncHandler(async (req, res) => {
    const data = await prisma.showroom.findMany({
      include: { manager: true, employees: true, inventory: true, targets: true },
      orderBy: { city: "asc" },
    });
    res.json({ data });
  })
);

router.post(
  "/showrooms",
  adminOnly,
  asyncHandler(async (req, res) => {
    sendCreated(res, await prisma.showroom.create({ data: req.body }));
  })
);

router.put(
  "/showrooms/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    const data = await prisma.showroom.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ data });
  })
);

router.get(
  "/expenses",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {
      ...(req.query.showroomId && { showroomId: req.query.showroomId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.month && { month: Number(req.query.month) }),
      ...(req.query.year && { year: Number(req.query.year) }),
    };
    const [data, total] = await Promise.all([
      prisma.expense.findMany({ where, skip, take, include: { showroom: true } }),
      prisma.expense.count({ where }),
    ]);
    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.post(
  "/expenses",
  adminOnly,
  asyncHandler(async (req, res) => {
    sendCreated(res, await prisma.expense.create({ data: req.body }));
  })
);

router.get(
  "/pipeline-logs",
  adminOnly,
  asyncHandler(async (req, res) => {
    const data = await prisma.pipelineLog.findMany({
      orderBy: { startedAt: "desc" },
      take: Number(req.query.limit || 50),
    });
    res.json({ data });
  })
);

router.post(
  "/leave-requests/:id/decision",
  adminOnly,
  asyncHandler(async (req, res) => {
    const data = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: {
        status: req.body.status,
        approvedById: req.user.id,
      },
    });
    res.json({ data });
  })
);

router.post(
  "/targets/showroom",
  adminOnly,
  asyncHandler(async (req, res) => {
    sendCreated(res, await prisma.showroomTarget.create({ data: req.body }));
  })
);

router.post(
  "/targets/employee",
  adminOnly,
  asyncHandler(async (req, res) => {
    sendCreated(res, await prisma.employeeTarget.create({ data: req.body }));
  })
);

module.exports = router;
