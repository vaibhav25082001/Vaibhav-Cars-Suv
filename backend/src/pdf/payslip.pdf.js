const { formatCurrency, formatDate, renderDocument } = require("./_branded.pdf");

module.exports = function generatePayslipPdf(data = {}) {
  const employee = data.employee || data;
  const gross = Number(data.grossSalary || employee.salary || 0);
  const deductions = Number(data.deductions || 0);
  return renderDocument({
    title: "Payslip",
    subtitle: `${data.month || new Date().getMonth() + 1}/${data.year || new Date().getFullYear()}`,
    sections: [
      { title: "Employee", rows: [["Name", employee.name], ["Code", employee.employeeCode], ["Role", employee.role], ["Department", employee.department], ["Showroom", employee.showroom?.name], ["Joining Date", formatDate(employee.joiningDate)]] },
      { title: "Salary", rows: [["Gross Salary", formatCurrency(gross)], ["Deductions", formatCurrency(deductions)], ["Net Pay", formatCurrency(gross - deductions)], ["Commission", formatCurrency(data.commissionEarned)]] },
    ],
  });
};
