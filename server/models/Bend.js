const mongoose = require("mongoose");

let Bend;

try {
  Bend = mongoose.model("bend");
} catch (e) {
  Bend = mongoose.model(
    "bend",
    new mongoose.Schema(
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
    )
  );
}

module.exports = Bend;
