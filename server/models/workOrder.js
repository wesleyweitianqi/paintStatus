const mongoose = require("mongoose");

const workOrderSchema = new mongoose.Schema(
  {
    wo: {
      type: String,
      required: true,
      min: 6,
    },
    catalogNum: {
      type: String,
      required: true,
    },
    po: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    customer: {
      type: String,
      required: true,
    },
    packingslip: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    order_date: {
      type: Date,
      required: true,
    },
    require_date: {
      type: Date,
      required: true,
    },
    shipping_state: {
      type: Boolean,
      required: true,
    },
    isProducing: {
      type: Boolean,
      required: true,
    },
    expedite: {
      type: Boolean,
    },
    files: {
      type: Array,
    },
    delete: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const WorkOrder = mongoose.model("WorkOrder", workOrderSchema);

const handleDatabaseUpdate = (callback) => {
  const changeStream = WorkOrder.watch();

  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const { _id, name } = change.fullDocument;
      callback({ id: _id.toString(), name });
    }
  });
};

module.exports = WorkOrder;
