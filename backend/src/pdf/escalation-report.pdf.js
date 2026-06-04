const { formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generateEscalationReportPdf(data = {}) {
  const escalations = data.escalations || data.rows || [];
  return renderDocument({
    title: "Escalation Report",
    subtitle: `${formatDate(data.from)} to ${formatDate(data.to)}`,
    sections: [
      { title: "Summary", rows: [["Escalations", escalations.length], ["Open Escalations", escalations.filter((row) => !row.resolvedAt).length], ["Resolved Escalations", escalations.filter((row) => row.resolvedAt).length]] },
    ],
    tables: [
      {
        title: "Escalations",
        columns: [
          { label: "Ticket", value: (row) => row.ticket?.ticketNumber, width: 90 },
          { label: "Level", key: "level", width: 45 },
          { label: "Reason", key: "reason", width: 165 },
          { label: "To", value: (row) => row.escalatedTo?.name, width: 95 },
          { label: "Created", value: (row) => formatDate(row.createdAt), width: 103 },
        ],
        rows: escalations,
      },
    ],
  });
};
