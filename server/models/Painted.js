const mongoose = require("mongoose");

const paintedSchema = new mongoose.Schema(
  {
    wo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    qty: {
      type: Number,
    },
    movedTo: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const Painted = mongoose.model("painted", paintedSchema);

module.exports = Painted;
