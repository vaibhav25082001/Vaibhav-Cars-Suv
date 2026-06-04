const { formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generateTestDriveConfirmPdf(booking = {}) {
  return renderDocument({
    title: "Test Drive Confirmation",
    subtitle: booking.id,
    sections: [
      { title: "Customer", rows: [["Name", booking.customer?.name], ["Email", booking.customer?.email], ["Phone", booking.customer?.phone]] },
      { title: "Booking", rows: [["Vehicle", booking.carModel?.name], ["Showroom", booking.showroom?.name], ["Address", booking.showroom?.address], ["Booking Date", formatDate(booking.bookingDate)], ["Time Slot", booking.timeSlot], ["Assigned Executive", booking.employee?.name], ["Status", booking.status]] },
    ],
  });
};
