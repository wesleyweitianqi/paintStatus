const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  path: String,
  url: String,
});

const errorLogSchema = new mongoose.Schema(
  {
    maintenance: String,
    category: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      default: "America/Toronto",
    },
    startTime: Date,
    endTime: Date,
    rootCause: String,
    solution: String,
    photo: photoSchema,
    photos: [photoSchema],
  },
  { timestamps: true }
);

const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);

module.exports = ErrorLog;
