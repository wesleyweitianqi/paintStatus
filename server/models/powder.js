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
  
},{ timestamps: true});

// Create indexes for better query performance
powderSchema.index({ createdAt: -1 });
powderSchema.index({ updatedAt: -1 });

const Powder = mongoose.model("powder", powderSchema);

module.exports = Powder;
