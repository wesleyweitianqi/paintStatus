const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const ErrorLog = require("../models/errorLog");

const router = express.Router();
const uploadDir = path.resolve(__dirname, "..", "upload", "error");

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

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

    const photo = req.file
      ? {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: path.join("upload", "error", req.file.filename),
          url: `/upload/error/${req.file.filename}`,
        }
      : null;

    const log = await ErrorLog.create({
      maintenance,
      category,
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

module.exports = router;
