const mongoose = require("mongoose");

const shiftEfficiencySchema = new mongoose.Schema(
  {
    shiftDate: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    plannedMinutes: {
      type: Number,
      default: 480,
    },
    runtimeMinutes: Number,
    downtimeMinutes: Number,
    runtimePercentage: Number,
    paintRecordCount: Number,
    paintQty: Number,
  },
  { timestamps: true }
);

const ShiftEfficiency = mongoose.model(
  "ShiftEfficiency",
  shiftEfficiencySchema
);

module.exports = ShiftEfficiency;
