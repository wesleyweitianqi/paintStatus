const express = require("express");
const fs = require("fs");
const moment = require("moment-timezone");
const multer = require("multer");
const path = require("path");
const ErrorLog = require("../models/errorLog");

const router = express.Router();
const uploadDir = path.resolve(__dirname, "..", "upload", "error");
const LOCAL_TIMEZONE = process.env.LOCAL_TIMEZONE || "America/Toronto";
const ERROR_LOG_EDIT_PASSWORD = process.env.ERROR_LOG_EDIT_PASSWORD || "Wes85";
const DATE_TIME_FORMATS = [
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DDTHH:mm",
  "YYYY-MM-DDTH:mm:ss",
  "YYYY-MM-DDTH:mm",
];

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName =
      path
        .basename(file.originalname, ext)
        .replace(/[^a-z0-9_-]/gi, "_")
        .slice(0, 40) || "photo";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image uploads are allowed"));
      return;
    }

    cb(null, true);
  },
});

const uploadPhoto = (req, res, next) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      res.status(400).send({ code: 1, message: err.message });
      return;
    }

    next();
  });
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = moment.tz(
    String(value).trim(),
    DATE_TIME_FORMATS,
    true,
    LOCAL_TIMEZONE
  );

  return parsed.isValid() ? parsed.toDate() : null;
};

const removeUploadedFile = (file) => {
  if (!file?.path) {
    return;
  }

  fs.unlink(file.path, (err) => {
    if (err) {
      console.error("Failed to remove uploaded error photo:", err);
    }
  });
};

const removeStoredPhoto = (photo) => {
  if (!photo?.path) {
    return;
  }

  const filePath = path.resolve(__dirname, "..", photo.path);
  if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
    return;
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Failed to remove previous error photo:", err);
    }
  });
};

const buildPhoto = (file) => ({
  filename: file.filename,
  originalName: file.originalname,
  mimetype: file.mimetype,
  size: file.size,
  path: path.join("upload", "error", file.filename),
  url: `/upload/error/${file.filename}`,
});

router.get("/", async (req, res) => {
  try {
    const logs = await ErrorLog.find().sort({ createdAt: -1 }).limit(100);
    res.send({ code: 0, data: logs });
  } catch (err) {
    console.error("Error fetching error logs:", err);
    res.status(500).send({ code: 1, message: "Error fetching error logs" });
  }
});

router.post("/", uploadPhoto, async (req, res) => {
  try {
    const { maintenance, category, startTime, endTime, rootCause, solution } =
      req.body;

    if (!category) {
      removeUploadedFile(req.file);
      res.status(400).send({ code: 1, message: "Category is required" });
      return;
    }

    const photo = req.file ? buildPhoto(req.file) : null;

    const log = await ErrorLog.create({
      maintenance,
      category,
      timezone: LOCAL_TIMEZONE,
      startTime: parseDate(startTime),
      endTime: parseDate(endTime),
      rootCause,
      solution,
      photo,
    });

    res.send({ code: 0, data: log, message: "Error log saved successfully" });
  } catch (err) {
    removeUploadedFile(req.file);
    console.error("Error saving error log:", err);
    res.status(500).send({ code: 1, message: "Error saving error log" });
  }
});

router.put("/:id", uploadPhoto, async (req, res) => {
  try {
    const {
      password,
      maintenance,
      category,
      startTime,
      endTime,
      rootCause,
      solution,
    } = req.body;

    if (password !== ERROR_LOG_EDIT_PASSWORD) {
      removeUploadedFile(req.file);
      res.status(401).send({ code: 1, message: "Invalid edit password" });
      return;
    }

    if (!category) {
      removeUploadedFile(req.file);
      res.status(400).send({ code: 1, message: "Category is required" });
      return;
    }

    const log = await ErrorLog.findById(req.params.id);
    if (!log) {
      removeUploadedFile(req.file);
      res.status(404).send({ code: 1, message: "Error log not found" });
      return;
    }

    const previousPhoto =
      log.photo && typeof log.photo.toObject === "function"
        ? log.photo.toObject()
        : log.photo;

    log.maintenance = maintenance;
    log.category = category;
    log.timezone = LOCAL_TIMEZONE;
    log.startTime = parseDate(startTime);
    log.endTime = parseDate(endTime);
    log.rootCause = rootCause;
    log.solution = solution;

    if (req.file) {
      log.photo = buildPhoto(req.file);
    }

    await log.save();

    if (req.file) {
      removeStoredPhoto(previousPhoto);
    }

    res.send({ code: 0, data: log, message: "Error log updated successfully" });
  } catch (err) {
    removeUploadedFile(req.file);
    console.error("Error updating error log:", err);
    res.status(500).send({ code: 1, message: "Error updating error log" });
  }
});

module.exports = router;
