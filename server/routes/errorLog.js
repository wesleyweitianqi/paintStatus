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
const MAX_ERROR_PHOTOS = 10;
const DATE_TIME_FORMATS = [
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DDTHH:mm",
  "YYYY-MM-DDTH:mm:ss",
  "YYYY-MM-DDTH:mm",
];

fs.mkdirSync(uploadDir, { recursive: true });

const toArray = (value) => (Array.isArray(value) ? value : []);

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

const uploadPhotos = (req, res, next) => {
  upload.fields([
    { name: "photos", maxCount: MAX_ERROR_PHOTOS },
    { name: "photo", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      removeUploadedFiles(getUploadedFiles(req));
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

const getUploadedFiles = (req) => [
  ...toArray(req.files?.photos),
  ...toArray(req.files?.photo),
];

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

const removeUploadedFiles = (files) => {
  toArray(files).forEach(removeUploadedFile);
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

const removeStoredPhotos = (photos) => {
  toArray(photos).forEach(removeStoredPhoto);
};

const buildPhoto = (file) => ({
  filename: file.filename,
  originalName: file.originalname,
  mimetype: file.mimetype,
  size: file.size,
  path: path.join("upload", "error", file.filename),
  url: `/upload/error/${file.filename}`,
});

const toPlainPhoto = (photo) => {
  if (!photo) {
    return null;
  }

  return typeof photo.toObject === "function" ? photo.toObject() : photo;
};

const isSamePhoto = (leftPhoto, rightPhoto) => {
  const left = toPlainPhoto(leftPhoto);
  const right = toPlainPhoto(rightPhoto);

  return Boolean(
    left &&
      right &&
      ((left.url && left.url === right.url) ||
        (left.filename && left.filename === right.filename))
  );
};

const getStoredPhotos = (log) => {
  const photos = toArray(log.photos)
    .map(toPlainPhoto)
    .filter((photo) => photo?.url);
  const legacyPhoto = toPlainPhoto(log.photo);

  if (
    legacyPhoto?.url &&
    !photos.some((photo) => isSamePhoto(photo, legacyPhoto))
  ) {
    return [legacyPhoto, ...photos];
  }

  return photos;
};

const parseKeptPhotoKeys = (value) => {
  if (value === undefined) {
    return null;
  }

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return new Set(toArray(parsed).map(String));
  } catch {
    return new Set();
  }
};

const shouldKeepPhoto = (photo, keptPhotoKeys) => {
  const plainPhoto = toPlainPhoto(photo);
  const keys = [
    plainPhoto?._id,
    plainPhoto?.url,
    plainPhoto?.filename,
  ]
    .filter(Boolean)
    .map(String);

  return keys.some((key) => keptPhotoKeys.has(key));
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

router.post("/", uploadPhotos, async (req, res) => {
  const uploadedFiles = getUploadedFiles(req);

  try {
    const { maintenance, category, startTime, endTime, rootCause, solution } =
      req.body;

    if (!category) {
      removeUploadedFiles(uploadedFiles);
      res.status(400).send({ code: 1, message: "Category is required" });
      return;
    }

    if (uploadedFiles.length > MAX_ERROR_PHOTOS) {
      removeUploadedFiles(uploadedFiles);
      res.status(400).send({
        code: 1,
        message: `Upload up to ${MAX_ERROR_PHOTOS} photos`,
      });
      return;
    }

    const photos = uploadedFiles.map(buildPhoto);

    const log = await ErrorLog.create({
      maintenance,
      category,
      timezone: LOCAL_TIMEZONE,
      startTime: parseDate(startTime),
      endTime: parseDate(endTime),
      rootCause,
      solution,
      photo: photos[0] || null,
      photos,
    });

    res.send({ code: 0, data: log, message: "Error log saved successfully" });
  } catch (err) {
    removeUploadedFiles(uploadedFiles);
    console.error("Error saving error log:", err);
    res.status(500).send({ code: 1, message: "Error saving error log" });
  }
});

router.put("/:id", uploadPhotos, async (req, res) => {
  const uploadedFiles = getUploadedFiles(req);

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
      removeUploadedFiles(uploadedFiles);
      res.status(401).send({ code: 1, message: "Invalid edit password" });
      return;
    }

    if (!category) {
      removeUploadedFiles(uploadedFiles);
      res.status(400).send({ code: 1, message: "Category is required" });
      return;
    }

    const log = await ErrorLog.findById(req.params.id);
    if (!log) {
      removeUploadedFiles(uploadedFiles);
      res.status(404).send({ code: 1, message: "Error log not found" });
      return;
    }

    const existingPhotos = getStoredPhotos(log);
    const keptPhotoKeys = parseKeptPhotoKeys(req.body.keptPhotoKeys);
    const keptExistingPhotos = keptPhotoKeys
      ? existingPhotos.filter((photo) => shouldKeepPhoto(photo, keptPhotoKeys))
      : existingPhotos;
    const removedPhotos = keptPhotoKeys
      ? existingPhotos.filter((photo) => !shouldKeepPhoto(photo, keptPhotoKeys))
      : [];
    const newPhotos = uploadedFiles.map(buildPhoto);
    const nextPhotos = [...keptExistingPhotos, ...newPhotos];

    if (nextPhotos.length > MAX_ERROR_PHOTOS) {
      removeUploadedFiles(uploadedFiles);
      res.status(400).send({
        code: 1,
        message: `Keep up to ${MAX_ERROR_PHOTOS} photos per log`,
      });
      return;
    }

    log.maintenance = maintenance;
    log.category = category;
    log.timezone = LOCAL_TIMEZONE;
    log.startTime = parseDate(startTime);
    log.endTime = parseDate(endTime);
    log.rootCause = rootCause;
    log.solution = solution;
    log.photos = nextPhotos;
    log.photo = nextPhotos[0] || null;

    await log.save();

    removeStoredPhotos(removedPhotos);

    res.send({ code: 0, data: log, message: "Error log updated successfully" });
  } catch (err) {
    removeUploadedFiles(uploadedFiles);
    console.error("Error updating error log:", err);
    res.status(500).send({ code: 1, message: "Error updating error log" });
  }
});

module.exports = router;
