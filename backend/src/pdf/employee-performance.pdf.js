const { formatCurrency, renderDocument } = require("./_branded.pdf");

module.exports = function generateEmployeePerformancePdf(data = {}) {
  const employees = data.employees || data.rows || [];
  return renderDocument({
    title: "Employee Performance",
    subtitle: `${data.month || ""}/${data.year || ""}`,
    sections: [
      { title: "Summary", rows: [["Employees", employees.length], ["Top Score", Math.max(0, ...employees.map((employee) => Number(employee.performanceScore || 0)))], ["Department", data.department || "All"]] },
    ],
    tables: [
      {
        title: "Performance",
        columns: [
          { label: "Employee", key: "name", width: 120 },
          { label: "Code", key: "employeeCode", width: 75 },
          { label: "Role", key: "role", width: 105 },
          { label: "Score", key: "performanceScore", width: 55 },
          { label: "Sales", value: (row) => row.targets?.[0]?.salesAchieved || 0, width: 50 },
          { label: "Revenue", value: (row) => formatCurrency(row.targets?.[0]?.revenueAchieved || 0), width: 93 },
        ],
        rows: employees,
      },
    ],
  });
};
