const mongoose = require("mongoose");

const errorLogSchema = new mongoose.Schema(
  {
    maintenance: String,
    category: {
      type: String,
      required: true,
    },
    startTime: Date,
    endTime: Date,
    rootCause: String,
    solution: String,
    photo: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      path: String,
      url: String,
    },
  },
  { timestamps: true }
);

const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);

module.exports = ErrorLog;
