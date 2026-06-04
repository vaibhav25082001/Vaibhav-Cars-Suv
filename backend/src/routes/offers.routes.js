const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { asyncHandler, getPagination, paginationMeta, parseDate, sendCreated } = require("./_helpers");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const now = new Date();
    const where = {
      ...(req.query.carModelId && { carModelId: req.query.carModelId }),
      ...(req.query.activeOnly === "true" && {
        isActive: true,
        validFrom: { lte: now },
        validTill: { gte: now },
      }),
    };
    const [data, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        skip,
        take,
        orderBy: { validTill: "asc" },
        include: { carModel: true },
      }),
      prisma.offer.count({ where }),
    ]);
    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.offer.create({
      data: {
        ...req.body,
        validFrom: parseDate(req.body.validFrom),
        validTill: parseDate(req.body.validTill),
      },
    });
    sendCreated(res, data);
  })
);

router.put(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.offer.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        validFrom: parseDate(req.body.validFrom),
        validTill: parseDate(req.body.validTill),
      },
    });
    res.json({ data });
  })
);

router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    await prisma.offer.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: "Offer deactivated" });
  })
);

module.exports = router;
