const mongoose = require("mongoose");

const ShearSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  workOrder: { type: String, required: true },
  partDescription: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Shear", ShearSchema);
