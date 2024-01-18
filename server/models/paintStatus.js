const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    wo: {
      type: String,
      required: true,
    },

    welded: {
      type: Boolean,
    },
    painted: {
      type: Boolean,
    },
    shipped: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const Status = mongoose.model("status", statusSchema);

module.exports = Status;