const mongoose = require("mongoose");

const coreClampSchema = new mongoose.Schema(
  {
    wo: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    isProducing: {
      type: Boolean,
      required: true,
    },
    isComplete: {
      type: Boolean,
      required: true,
    },
    files: {
      type: Array,
    },
    approvedBy: {
      type: String,
    },
  },
  { timestamps: true }
);

const CoreClamp = mongoose.model("coreclamp", coreClampSchema);

module.exports = CoreClamp;
