const express = require("express");
const moment = require("moment-timezone");
const Painted = require("../models/painted");
const ShiftEfficiency = require("../models/shiftEfficiency");

const router = express.Router();
const PLANNED_SHIFT_MINUTES = 8 * 60;
const LOCAL_TIMEZONE = process.env.LOCAL_TIMEZONE || "America/Toronto";
const SHIFT_HISTORY_PASSWORD = process.env.SHIFT_HISTORY_PASSWORD || "Wes85";
const SHIFT_TIME_FORMATS = [
  "YYYY-MM-DD HH:mm:ss",
  "YYYY-MM-DD HH:mm",
  "YYYY-MM-DD H:mm:ss",
  "YYYY-MM-DD H:mm",
];

const parseShiftMoment = (shiftDate, timeValue) => {
  if (!shiftDate || !timeValue) {
    return null;
  }

  const parsed = moment.tz(
    `${shiftDate} ${String(timeValue).trim()}`,
    SHIFT_TIME_FORMATS,
    true,
    LOCAL_TIMEZONE
  );

  return parsed.isValid() ? parsed : null;
};

const roundOneDecimal = (value) => Math.round(value * 10) / 10;
const getCurrentLocalTime = () => moment().tz(LOCAL_TIMEZONE).format("HH:mm");

const buildShiftData = async ({ shiftDate, startTime, endTime }) => {
  const parsedStart = parseShiftMoment(shiftDate, startTime);
  const resolvedEndTime = endTime || getCurrentLocalTime();
  const parsedEnd = parseShiftMoment(shiftDate, resolvedEndTime);

  if (!parsedStart || !parsedEnd) {
    return null;
  }

  let actualEnd = parsedEnd.clone();
  if (!actualEnd.isAfter(parsedStart)) {
    actualEnd = actualEnd.add(1, "day");
  }

  const runtimeMinutes = actualEnd.diff(parsedStart, "minutes");
  const downtimeMinutes = Math.max(PLANNED_SHIFT_MINUTES - runtimeMinutes, 0);
  const runtimePercentage = roundOneDecimal(
    (runtimeMinutes / PLANNED_SHIFT_MINUTES) * 100
  );

  const paintRecords = await Painted.find({
    createdAt: {
      $gte: parsedStart.toDate(),
      $lte: actualEnd.toDate(),
    },
  });

  const paintQty = paintRecords.reduce((total, record) => {
    const qty = Number(record.qty);
    return Number.isFinite(qty) ? total + qty : total;
  }, 0);

  return {
    shiftDate: parsedStart.format("YYYY-MM-DD"),
    timezone: LOCAL_TIMEZONE,
    startDateLocal: parsedStart.format("YYYY-MM-DD"),
    endDateLocal: actualEnd.format("YYYY-MM-DD"),
    startTimeLocal: parsedStart.format("HH:mm"),
    endTimeLocal: actualEnd.format("HH:mm"),
    startTime: parsedStart.toDate(),
    endTime: actualEnd.toDate(),
    plannedMinutes: PLANNED_SHIFT_MINUTES,
    runtimeMinutes,
    downtimeMinutes,
    runtimePercentage,
    paintRecordCount: paintRecords.length,
    paintQty,
  };
};

router.get("/", async (req, res) => {
  try {
    const records = await ShiftEfficiency.find()
      .sort({ shiftDate: -1, startTime: -1 })
      .limit(100);

    res.send({ code: 0, data: records });
  } catch (err) {
    console.error("Error fetching shift efficiency records:", err);
    res
      .status(500)
      .send({ code: 1, message: "Error fetching shift efficiency records" });
  }
});

router.post("/", async (req, res) => {
  try {
    const shiftData = await buildShiftData(req.body);

    if (!shiftData) {
      res.status(400).send({
        code: 1,
        message: "Shift date and start time are required",
      });
      return;
    }

    const record = await ShiftEfficiency.create(shiftData);

    res.send({
      code: 0,
      data: record,
      message: "Shift efficiency record saved successfully",
    });
  } catch (err) {
    console.error("Error saving shift efficiency record:", err);
    res
      .status(500)
      .send({ code: 1, message: "Error saving shift efficiency record" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { password, ...shiftValues } = req.body || {};

    if (password !== SHIFT_HISTORY_PASSWORD) {
      res.status(401).send({ code: 1, message: "Invalid edit password" });
      return;
    }

    const shiftData = await buildShiftData(shiftValues);
    if (!shiftData) {
      res.status(400).send({
        code: 1,
        message: "Shift date and start time are required",
      });
      return;
    }

    const record = await ShiftEfficiency.findByIdAndUpdate(
      req.params.id,
      shiftData,
      { new: true }
    );

    if (!record) {
      res.status(404).send({ code: 1, message: "Shift record not found" });
      return;
    }

    res.send({
      code: 0,
      data: record,
      message: "Shift efficiency record updated successfully",
    });
  } catch (err) {
    console.error("Error updating shift efficiency record:", err);
    res
      .status(500)
      .send({ code: 1, message: "Error updating shift efficiency record" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { password } = req.body || {};

    if (password !== SHIFT_HISTORY_PASSWORD) {
      res.status(401).send({ code: 1, message: "Invalid delete password" });
      return;
    }

    const record = await ShiftEfficiency.findByIdAndDelete(req.params.id);
    if (!record) {
      res.status(404).send({ code: 1, message: "Shift record not found" });
      return;
    }

    res.send({
      code: 0,
      data: true,
      message: "Shift efficiency record deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting shift efficiency record:", err);
    res
      .status(500)
      .send({ code: 1, message: "Error deleting shift efficiency record" });
  }
});

module.exports = router;
