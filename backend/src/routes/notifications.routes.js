const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { asyncHandler, getPagination, paginationMeta, sendCreated } = require("./_helpers");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {
      ...(req.query.recipientId && { recipientId: req.query.recipientId }),
      ...(req.query.recipientType && { recipientType: req.query.recipientType }),
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.isRead !== undefined && { isRead: req.query.isRead === "true" }),
    };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.notification.count({ where }),
    ]);
    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    sendCreated(res, await prisma.notification.create({ data: req.body }));
  })
);

router.put(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const data = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ data });
  })
);

router.put(
  "/mark-all-read",
  asyncHandler(async (req, res) => {
    const result = await prisma.notification.updateMany({
      where: {
        recipientId: req.body.recipientId,
        recipientType: req.body.recipientType,
        isRead: false,
      },
      data: { isRead: true },
    });
    res.json({ data: result });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.json({ message: "Notification deleted" });
  })
);

module.exports = router;
