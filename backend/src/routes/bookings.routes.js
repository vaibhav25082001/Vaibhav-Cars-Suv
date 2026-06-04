const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { asyncHandler, getPagination, paginationMeta, parseDate, sendCreated } = require("./_helpers");

const router = express.Router();

router.get(
  "/test-drives",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {
      ...(req.query.customerId && { customerId: req.query.customerId }),
      ...(req.query.showroomId && { showroomId: req.query.showroomId }),
      ...(req.query.employeeId && { employeeId: req.query.employeeId }),
      ...(req.query.status && { status: req.query.status }),
    };

    const [data, total] = await Promise.all([
      prisma.testDriveBooking.findMany({
        where,
        skip,
        take,
        orderBy: { bookingDate: "desc" },
        include: { customer: true, carModel: true, showroom: true, employee: true },
      }),
      prisma.testDriveBooking.count({ where }),
    ]);

    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.post(
  "/test-drives",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.testDriveBooking.create({
      data: { ...req.body, bookingDate: parseDate(req.body.bookingDate) },
    });
    sendCreated(res, data);
  })
);

router.put(
  "/test-drives/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.testDriveBooking.update({
      where: { id: req.params.id },
      data: { ...req.body, bookingDate: parseDate(req.body.bookingDate) },
    });
    res.json({ data });
  })
);

router.get(
  "/services",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {
      ...(req.query.customerId && { customerId: req.query.customerId }),
      ...(req.query.showroomId && { showroomId: req.query.showroomId }),
      ...(req.query.mechanicId && { mechanicId: req.query.mechanicId }),
      ...(req.query.status && { status: req.query.status }),
    };

    const [data, total] = await Promise.all([
      prisma.serviceBooking.findMany({
        where,
        skip,
        take,
        orderBy: { bookingDate: "desc" },
        include: {
          customer: true,
          customerVehicle: { include: { carModel: true } },
          showroom: true,
          mechanic: true,
          jobItems: true,
        },
      }),
      prisma.serviceBooking.count({ where }),
    ]);

    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.post(
  "/services",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { jobItems, ...booking } = req.body;
    const data = await prisma.serviceBooking.create({
      data: {
        ...booking,
        bookingDate: parseDate(booking.bookingDate),
        ...(jobItems && { jobItems: { create: jobItems } }),
      },
      include: { jobItems: true },
    });
    sendCreated(res, data);
  })
);

router.put(
  "/services/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.serviceBooking.update({
      where: { id: req.params.id },
      data: { ...req.body, bookingDate: parseDate(req.body.bookingDate) },
    });
    res.json({ data });
  })
);

router.post(
  "/services/:id/job-items",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.serviceJobItem.create({
      data: { ...req.body, serviceBookingId: req.params.id },
    });
    sendCreated(res, data);
  })
);

module.exports = router;
