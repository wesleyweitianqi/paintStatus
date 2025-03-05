const mongoose = require("mongoose");

const powderSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  supplier: {
    type: String,
  },
  desc: {
    type: String,
  },
});

const Powder = mongoose.model("powder", powderSchema);

module.exports = Powder;
