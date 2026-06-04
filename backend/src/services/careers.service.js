const { createCrudService, toDate } = require("./_base.service");

const openings = createCrudService("jobOpening", {
  filters: { department: "string", location: "string", jobType: "string", isActive: "boolean" },
  searchFields: ["title", "department", "location", "description", "requirements"],
  sortFields: ["title", "department", "location", "createdAt", "openingsCount"],
  requiredCreate: ["title", "department", "location", "jobType", "description", "requirements", "salaryRange", "openingsCount"],
  include: { applications: true },
  softDeleteField: "isActive",
});

const applications = createCrudService("jobApplication", {
  filters: { jobOpeningId: "string", status: "string", email: "string" },
  searchFields: ["applicantName", "email", "phone", "applicationId", "coverLetter", "notes"],
  sortFields: ["applicantName", "createdAt", "updatedAt", "status"],
  dateField: "createdAt",
  requiredCreate: ["jobOpeningId", "applicantName", "email", "phone", "resumeUrl", "coverLetter", "applicationId"],
  mapUpdate: (data) => ({ ...data, createdAt: toDate(data.createdAt, "createdAt") }),
  include: { jobOpening: true },
});

module.exports = {
  ...openings,
  openings,
  applications,
};
