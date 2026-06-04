const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { asyncHandler, getPagination, paginationMeta, sendCreated } = require("./_helpers");

const router = express.Router();

router.get(
  "/openings",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {
      ...(req.query.department && { department: req.query.department }),
      ...(req.query.location && { location: req.query.location }),
      ...(req.query.jobType && { jobType: req.query.jobType }),
      ...(req.query.activeOnly === "true" && { isActive: true }),
    };
    const [data, total] = await Promise.all([
      prisma.jobOpening.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { applications: true },
      }),
      prisma.jobOpening.count({ where }),
    ]);
    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.post(
  "/openings",
  authMiddleware,
  asyncHandler(async (req, res) => {
    sendCreated(res, await prisma.jobOpening.create({ data: req.body }));
  })
);

router.put(
  "/openings/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.jobOpening.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ data });
  })
);

router.post(
  "/openings/:id/apply",
  asyncHandler(async (req, res) => {
    const data = await prisma.jobApplication.create({
      data: {
        ...req.body,
        jobOpeningId: req.params.id,
        applicationId: req.body.applicationId || `VC-APP-${Date.now()}`,
      },
    });
    sendCreated(res, data);
  })
);

router.get(
  "/applications",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.jobApplication.findMany({
      where: req.query.status ? { status: req.query.status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { jobOpening: true },
    });
    res.json({ data });
  })
);

router.put(
  "/applications/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.jobApplication.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ data });
  })
);

module.exports = router;
