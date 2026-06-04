const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = path.join(__dirname, "../../uploads");

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function ensureDirectory(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function safeFileName(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const baseName = path
    .basename(file.originalname, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
    baseName || "upload"
  }${extension}`;
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const folder = req.uploadFolder || req.body?.folder || "general";
    const safeFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, "");
    const destination = path.join(uploadRoot, safeFolder || "general");

    ensureDirectory(destination);
    callback(null, destination);
  },
  filename(req, file, callback) {
    callback(null, safeFileName(file));
  },
});

function fileFilter(req, file, callback) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return callback(new Error(`Unsupported file type: ${file.mimetype}`));
  }

  return callback(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_UPLOAD_SIZE || 10 * 1024 * 1024),
    files: Number(process.env.MAX_UPLOAD_FILES || 5),
  },
});

function setUploadFolder(folder) {
  return (req, res, next) => {
    req.uploadFolder = folder;
    next();
  };
}

module.exports = {
  upload,
  setUploadFolder,
  singleUpload: (fieldName = "file") => upload.single(fieldName),
  multipleUpload: (fieldName = "files", maxCount = 5) =>
    upload.array(fieldName, maxCount),
  fieldsUpload: (fields) => upload.fields(fields),
};
