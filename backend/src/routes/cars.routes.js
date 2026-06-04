const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { asyncHandler, getPagination, paginationMeta, sendCreated } = require("./_helpers");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.fuelType && { fuelType: req.query.fuelType }),
      ...(req.query.isActive !== undefined && {
        isActive: req.query.isActive === "true",
      }),
      ...(req.query.search && {
        name: { contains: req.query.search, mode: "insensitive" },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.carModel.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { offers: true, inventory: true },
      }),
      prisma.carModel.count({ where }),
    ]);

    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await prisma.carModel.findUnique({
      where: { id: req.params.id },
      include: { inventory: { include: { showroom: true } }, offers: true },
    });

    if (!data) {
      return res.status(404).json({ message: "Car model not found" });
    }

    res.json({ data });
  })
);

router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.carModel.create({ data: req.body });
    sendCreated(res, data);
  })
);

router.put(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.carModel.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ data });
  })
);

router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    await prisma.carModel.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ message: "Car model deactivated" });
  })
);

module.exports = router;
