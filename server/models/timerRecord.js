const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timerRecordSchema = new Schema(
  {
    startTime: Date,
    endTime: Date,
    isRunning: {
      type: Boolean,
      default: false
    },
    operator: String,
    notes: String
  },
  { timestamps: true }
);

const TimerRecord = mongoose.model("TimerRecord", timerRecordSchema);

module.exports = TimerRecord; 