const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { asyncHandler, getPagination, paginationMeta, parseDate, sendCreated } = require("./_helpers");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.carModelId && { carModelId: req.query.carModelId }),
      ...(req.query.showroomId && { showroomId: req.query.showroomId }),
      ...(req.query.color && {
        color: { contains: req.query.color, mode: "insensitive" },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.carInventory.findMany({
        where,
        skip,
        take,
        orderBy: { arrivalDate: "desc" },
        include: { carModel: true, showroom: true, purchase: true },
      }),
      prisma.carInventory.count({ where }),
    ]);

    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await prisma.carInventory.findUnique({
      where: { id: req.params.id },
      include: { carModel: true, showroom: true, purchase: true },
    });

    if (!data) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    res.json({ data });
  })
);

router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.carInventory.create({
      data: { ...req.body, arrivalDate: parseDate(req.body.arrivalDate) },
    });
    sendCreated(res, data);
  })
);

router.put(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.carInventory.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        arrivalDate: parseDate(req.body.arrivalDate),
        soldDate: parseDate(req.body.soldDate),
      },
    });
    res.json({ data });
  })
);

router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    await prisma.carInventory.delete({ where: { id: req.params.id } });
    res.json({ message: "Inventory item deleted" });
  })
);

module.exports = router;
