const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { asyncHandler } = require("./_helpers");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/sales",
  asyncHandler(async (req, res) => {
    const data = await prisma.dailySalesSummary.findMany({
      where: {
        ...(req.query.showroomId && { showroomId: req.query.showroomId }),
      },
      orderBy: { date: "desc" },
      take: Number(req.query.limit || 30),
      include: { showroom: true },
    });
    res.json({ data });
  })
);

router.get(
  "/revenue",
  asyncHandler(async (req, res) => {
    const data = await prisma.monthlyRevenueSummary.findMany({
      where: {
        ...(req.query.showroomId && { showroomId: req.query.showroomId }),
        ...(req.query.year && { year: Number(req.query.year) }),
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { showroom: true },
    });
    res.json({ data });
  })
);

router.get(
  "/leads",
  asyncHandler(async (req, res) => {
    const [byStage, byPriority, total] = await Promise.all([
      prisma.lead.groupBy({ by: ["stage"], _count: { id: true } }),
      prisma.lead.groupBy({ by: ["priority"], _count: { id: true } }),
      prisma.lead.count(),
    ]);
    res.json({ data: { total, byStage, byPriority } });
  })
);

router.get(
  "/support",
  asyncHandler(async (req, res) => {
    const [byStatus, byPriority, bySentiment] = await Promise.all([
      prisma.supportTicket.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.supportTicket.groupBy({ by: ["priority"], _count: { id: true } }),
      prisma.supportTicket.groupBy({ by: ["sentiment"], _count: { id: true } }),
    ]);
    res.json({ data: { byStatus, byPriority, bySentiment } });
  })
);

router.get(
  "/inventory",
  asyncHandler(async (req, res) => {
    const [byStatus, byModel] = await Promise.all([
      prisma.carInventory.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.carInventory.groupBy({ by: ["carModelId"], _count: { id: true } }),
    ]);
    res.json({ data: { byStatus, byModel } });
  })
);

module.exports = router;
