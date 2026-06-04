const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { asyncHandler, getPagination, paginationMeta, parseDate, sendCreated } = require("./_helpers");

const router = express.Router();

router.get(
  "/tickets",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {
      ...(req.query.customerId && { customerId: req.query.customerId }),
      ...(req.query.assignedToId && { assignedToId: req.query.assignedToId }),
      ...(req.query.priority && { priority: req.query.priority }),
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.issueType && { issueType: req.query.issueType }),
      ...(req.query.sentiment && { sentiment: req.query.sentiment }),
    };

    const [data, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { customer: true, assignedTo: true, messages: true, escalations: true },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.get(
  "/tickets/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.supportTicket.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        assignedTo: true,
        messages: true,
        escalations: { include: { escalatedBy: true, escalatedTo: true } },
      },
    });

    if (!data) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({ data });
  })
);

router.post(
  "/tickets",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.supportTicket.create({
      data: { ...req.body, slaDeadline: parseDate(req.body.slaDeadline) },
    });
    sendCreated(res, data);
  })
);

router.put(
  "/tickets/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        slaDeadline: parseDate(req.body.slaDeadline),
        resolvedAt: parseDate(req.body.resolvedAt),
      },
    });
    res.json({ data });
  })
);

router.post(
  "/tickets/:id/messages",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.ticketMessage.create({
      data: { ...req.body, ticketId: req.params.id },
    });
    sendCreated(res, data);
  })
);

router.post(
  "/tickets/:id/escalations",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.ticketEscalation.create({
      data: { ...req.body, ticketId: req.params.id },
    });

    await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: { status: "Escalated" },
    });

    sendCreated(res, data);
  })
);

router.get(
  "/canned-responses",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.cannedResponse.findMany({
      where: req.query.category ? { category: req.query.category } : undefined,
      orderBy: { createdAt: "desc" },
    });
    res.json({ data });
  })
);

router.post(
  "/canned-responses",
  authMiddleware,
  asyncHandler(async (req, res) => {
    sendCreated(res, await prisma.cannedResponse.create({ data: req.body }));
  })
);

router.get(
  "/kb",
  asyncHandler(async (req, res) => {
    const data = await prisma.kbArticle.findMany({
      where: {
        ...(req.query.category && { category: req.query.category }),
        ...(req.query.publicOnly === "true" && { isPublic: true }),
      },
      orderBy: { useCount: "desc" },
    });
    res.json({ data });
  })
);

module.exports = router;
