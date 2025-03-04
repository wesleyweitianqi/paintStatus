const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paintPrioritySchema = new Schema(
  {
    wo: String,
    description: String,
    qty: Number,
    priority: Number,
    notes: String,
    complete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const PaintPriority = mongoose.model("paintPriority", paintPrioritySchema);

module.exports = PaintPriority;
