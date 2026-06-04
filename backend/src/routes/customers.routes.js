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
      ...(req.query.city && { city: { contains: req.query.city, mode: "insensitive" } }),
      ...(req.query.tag && { tag: req.query.tag }),
      ...(req.query.search && {
        OR: [
          { name: { contains: req.query.search, mode: "insensitive" } },
          { email: { contains: req.query.search, mode: "insensitive" } },
          { phone: { contains: req.query.search, mode: "insensitive" } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { vehicles: true, supportTickets: true, leads: true },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        vehicles: { include: { carModel: true } },
        purchases: true,
        testDrives: true,
        serviceBookings: true,
        supportTickets: true,
        wishlists: { include: { carModel: true } },
      },
    });

    if (!data) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ data });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const passwordHash = await bcrypt.hash(req.body.password || "Password@123", 10);
    const data = await prisma.customer.create({
      data: { ...req.body, password: undefined, passwordHash },
    });
    sendCreated(res, data);
  })
);

router.put(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ data });
  })
);

router.post(
  "/:id/vehicles",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.customerVehicle.create({
      data: {
        ...req.body,
        customerId: req.params.id,
        purchaseDate: parseDate(req.body.purchaseDate),
        insuranceExpiry: parseDate(req.body.insuranceExpiry),
        nextServiceDue: parseDate(req.body.nextServiceDue),
      },
    });
    sendCreated(res, data);
  })
);

router.post(
  "/:id/activity",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.customerActivityLog.create({
      data: { ...req.body, customerId: req.params.id },
    });
    sendCreated(res, data);
  })
);

module.exports = router;
