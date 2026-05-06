const express = require("express");
const moment = require("moment-timezone");
const Painted = require("../models/painted");
const ShiftEfficiency = require("../models/shiftEfficiency");

const router = express.Router();
const PLANNED_SHIFT_MINUTES = 8 * 60;
const LOCAL_TIMEZONE = process.env.LOCAL_TIMEZONE || "America/Toronto";
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
    const { shiftDate, startTime, endTime } = req.body;
    const parsedStart = parseShiftMoment(shiftDate, startTime);
    const parsedEnd = parseShiftMoment(shiftDate, endTime);

    if (!parsedStart || !parsedEnd) {
      res.status(400).send({
        code: 1,
        message: "Shift date, start time, and end time are required",
      });
      return;
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

    const record = await ShiftEfficiency.create({
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
    });

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

module.exports = router;
