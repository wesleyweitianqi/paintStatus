const express = require("express");
const Painted = require("../models/painted");
const ShiftEfficiency = require("../models/shiftEfficiency");

const router = express.Router();
const PLANNED_SHIFT_MINUTES = 8 * 60;

const parseShiftDateTime = (shiftDate, timeValue) => {
  if (!shiftDate || !timeValue) {
    return null;
  }

  const normalizedTime = timeValue.length === 5 ? `${timeValue}:00` : timeValue;
  const date = new Date(`${shiftDate}T${normalizedTime}`);
  return Number.isNaN(date.getTime()) ? null : date;
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
    const parsedStart = parseShiftDateTime(shiftDate, startTime);
    const parsedEnd = parseShiftDateTime(shiftDate, endTime);

    if (!parsedStart || !parsedEnd) {
      res.status(400).send({
        code: 1,
        message: "Shift date, start time, and end time are required",
      });
      return;
    }

    let actualEnd = parsedEnd;
    if (actualEnd <= parsedStart) {
      actualEnd = new Date(actualEnd.getTime() + 24 * 60 * 60 * 1000);
    }

    const runtimeMinutes = Math.round(
      (actualEnd.getTime() - parsedStart.getTime()) / 60000
    );
    const downtimeMinutes = Math.max(PLANNED_SHIFT_MINUTES - runtimeMinutes, 0);
    const runtimePercentage = roundOneDecimal(
      (runtimeMinutes / PLANNED_SHIFT_MINUTES) * 100
    );

    const paintRecords = await Painted.find({
      createdAt: {
        $gte: parsedStart,
        $lte: actualEnd,
      },
    });

    const paintQty = paintRecords.reduce((total, record) => {
      const qty = Number(record.qty);
      return Number.isFinite(qty) ? total + qty : total;
    }, 0);

    const record = await ShiftEfficiency.create({
      shiftDate,
      startTime: parsedStart,
      endTime: actualEnd,
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
