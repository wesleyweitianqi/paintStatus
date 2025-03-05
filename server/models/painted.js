const mongoose = require("mongoose");

let Painted;

try {
  Painted = mongoose.model("painted");
} catch (e) {
  Painted = mongoose.model(
    "painted",
    new mongoose.Schema(
      {
        wo: String,
        description: String,
        qty: Number,
        movedTo: String,
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

module.exports = Painted;
