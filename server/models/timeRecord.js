const mongoose = require("mongoose");

const timeRecordSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    default: null,
  },
});

const TimeRecord = mongoose.model("timeRecord", timeRecordSchema);

module.exports = TimeRecord;
