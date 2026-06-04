const express = require("express");
const { prisma } = require("../config/db");
const { authMiddleware } = require("../middleware/auth.middleware");
const {
  createPdfDocument,
  collectPdfBuffer,
  writeHeader,
  writeKeyValueRows,
  writeTable,
  formatCurrency,
} = require("../utils/pdf-helpers.util");
const { asyncHandler } = require("./_helpers");

const router = express.Router();

router.use(authMiddleware);

async function sendPdf(res, filename, build) {
  const doc = createPdfDocument();
  const bufferPromise = collectPdfBuffer(doc);

  build(doc);
  doc.end();

  const buffer = await bufferPromise;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.send(buffer);
}

router.get(
  "/invoice/:purchaseId",
  asyncHandler(async (req, res) => {
    const purchase = await prisma.purchase.findUnique({
      where: { id: req.params.purchaseId },
      include: {
        customer: true,
        carInventory: { include: { carModel: true } },
        showroom: true,
        employee: true,
        emiPayments: true,
      },
    });

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    await sendPdf(res, `${purchase.invoiceNumber}.pdf`, (doc) => {
      writeHeader(doc, "Vaibhav Cars Invoice", purchase.invoiceNumber);
      writeKeyValueRows(doc, [
        ["Customer", purchase.customer.name],
        ["Email", purchase.customer.email],
        ["Showroom", purchase.showroom.name],
        ["Vehicle", purchase.carInventory.carModel.name],
        ["VIN", purchase.carInventory.vin],
        ["Purchase Date", purchase.purchaseDate.toDateString()],
        ["Payment Type", purchase.paymentType],
        ["Total Amount", formatCurrency(purchase.totalAmount)],
      ]);
      writeTable(
        doc,
        [
          { key: "label", label: "Charge" },
          { key: "amount", label: "Amount" },
        ],
        [
          { label: "Ex-showroom", amount: formatCurrency(purchase.exShowroomPrice) },
          { label: "RTO", amount: formatCurrency(purchase.rtoCharges) },
          { label: "Insurance", amount: formatCurrency(purchase.insuranceAmount) },
          { label: "Accessories", amount: formatCurrency(purchase.accessoriesCost) },
          { label: "GST", amount: formatCurrency(purchase.gstAmount) },
          { label: "Total", amount: formatCurrency(purchase.totalAmount) },
        ]
      );
    });
  })
);

router.get(
  "/test-drive/:bookingId",
  asyncHandler(async (req, res) => {
    const booking = await prisma.testDriveBooking.findUnique({
      where: { id: req.params.bookingId },
      include: { customer: true, carModel: true, showroom: true, employee: true },
    });

    if (!booking) {
      return res.status(404).json({ message: "Test drive booking not found" });
    }

    await sendPdf(res, `test-drive-${booking.id}.pdf`, (doc) => {
      writeHeader(doc, "Test Drive Booking", booking.carModel.name);
      writeKeyValueRows(doc, [
        ["Customer", booking.customer.name],
        ["Phone", booking.customer.phone],
        ["Showroom", booking.showroom.name],
        ["Date", booking.bookingDate.toDateString()],
        ["Time Slot", booking.timeSlot],
        ["Status", booking.status],
        ["Assigned Employee", booking.employee?.name || "Pending assignment"],
      ]);
    });
  })
);

router.get(
  "/service/:bookingId",
  asyncHandler(async (req, res) => {
    const booking = await prisma.serviceBooking.findUnique({
      where: { id: req.params.bookingId },
      include: {
        customer: true,
        customerVehicle: { include: { carModel: true } },
        showroom: true,
        mechanic: true,
        jobItems: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Service booking not found" });
    }

    await sendPdf(res, `service-${booking.id}.pdf`, (doc) => {
      writeHeader(doc, "Service Job Card", booking.customerVehicle.carModel.name);
      writeKeyValueRows(doc, [
        ["Customer", booking.customer.name],
        ["Vehicle", booking.customerVehicle.registrationNumber],
        ["Service Type", booking.serviceType],
        ["Booking Date", booking.bookingDate.toDateString()],
        ["Status", booking.status],
        ["Estimated Cost", formatCurrency(booking.estimatedCost)],
        ["Mechanic", booking.mechanic?.name || "Pending assignment"],
      ]);
      writeTable(
        doc,
        [
          { key: "itemDescription", label: "Item" },
          { key: "itemType", label: "Type" },
          { key: "quantity", label: "Qty" },
          { key: "totalPrice", label: "Total" },
        ],
        booking.jobItems.map((item) => ({
          ...item,
          totalPrice: formatCurrency(item.totalPrice),
        }))
      );
    });
  })
);

module.exports = router;
