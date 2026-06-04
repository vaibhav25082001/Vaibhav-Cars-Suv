const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const { generateAmortizationSchedule } = require("../utils/emi-calculator.util");
const { asyncHandler, getPagination, paginationMeta, parseDate, sendCreated } = require("./_helpers");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, skip, take } = getPagination(req.query);
    const where = {
      ...(req.query.customerId && { customerId: req.query.customerId }),
      ...(req.query.employeeId && { employeeId: req.query.employeeId }),
      ...(req.query.showroomId && { showroomId: req.query.showroomId }),
      ...(req.query.paymentType && { paymentType: req.query.paymentType }),
    };

    const [data, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        skip,
        take,
        orderBy: { purchaseDate: "desc" },
        include: {
          customer: true,
          carInventory: { include: { carModel: true } },
          employee: true,
          showroom: true,
          emiPayments: true,
        },
      }),
      prisma.purchase.count({ where }),
    ]);

    res.json({ data, meta: paginationMeta(page, limit, total) });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = await prisma.purchase.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        carInventory: { include: { carModel: true, showroom: true } },
        carConfiguration: true,
        employee: true,
        showroom: true,
        emiPayments: true,
      },
    });

    if (!data) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    res.json({ data });
  })
);

router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { createEmiSchedule, ...payload } = req.body;
    const data = await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          ...payload,
          purchaseDate: parseDate(payload.purchaseDate),
          deliveryDate: parseDate(payload.deliveryDate),
        },
      });

      if (createEmiSchedule && payload.loanAmount && payload.loanRate && payload.loanTenure) {
        const schedule = generateAmortizationSchedule(
          payload.loanAmount,
          payload.loanRate,
          payload.loanTenure
        );

        await tx.emiPayment.createMany({
          data: schedule.map((item) => ({
            purchaseId: purchase.id,
            customerId: purchase.customerId,
            monthNumber: item.monthNumber,
            dueDate: new Date(
              new Date(purchase.purchaseDate).setMonth(
                new Date(purchase.purchaseDate).getMonth() + item.monthNumber
              )
            ),
            principalAmount: item.principalAmount,
            interestAmount: item.interestAmount,
            emiAmount: item.emiAmount,
            balanceRemaining: item.balanceRemaining,
            status: "Due",
          })),
        });
      }

      await tx.carInventory.update({
        where: { id: purchase.carInventoryId },
        data: { status: "Sold", soldDate: purchase.purchaseDate },
      });

      return purchase;
    });

    sendCreated(res, data);
  })
);

router.put(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.purchase.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        purchaseDate: parseDate(req.body.purchaseDate),
        deliveryDate: parseDate(req.body.deliveryDate),
      },
    });
    res.json({ data });
  })
);

router.put(
  "/emi/:id/pay",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await prisma.emiPayment.update({
      where: { id: req.params.id },
      data: { status: "Paid", paidDate: parseDate(req.body.paidDate) || new Date() },
    });
    res.json({ data });
  })
);

module.exports = router;
