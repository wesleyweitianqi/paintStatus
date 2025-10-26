var express = require("express");
var router = express.Router();
const Powder = require("../models/powder");

router.get("/", async (req, res) => {
  try {
    const result = await Powder.find();
    res.send({ code: 0, data: result });
  } catch (e) {
    console.log(e);
  }
});

router.post("/add", async (req, res) => {
  try {
    const { code, qty, desc, supplier } = req.body;
    const powder = new Powder({
      code: code,
      desc: desc,
      supplier: supplier,
      qty: qty,
     
    });
    await powder.save();
    const result = await Powder.find();
    res.send({ code: 0, data: result });
  } catch (e) {
    console.log(e);
  }
});

router.post("/update", async (req, res) => {
  try {
    const { code, qty, desc, supplier } = req.body;
    const result = await Powder.findOneAndUpdate(
      { code: code },
      { qty: qty, supplier: supplier, desc: desc }
    );
    if (result) {
      const list = await Powder.find().sort({createdAt:-1}).lean();
      res.send({ code: 0, data: list });
    } else {
      res.send({ code: 1, data: false });
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/delete", async (req, res) => {
  try {
    const { code } = req.body;
    const result = await Powder.findOneAndDelete({ code: code });
    if (result) {
      res.send({ code: 0, data: true });
    } else {
      res.send({ code: 1, data: false });
    }
  } catch (e) {
    console.log(e);
  }
});

// Export powder list to Excel
const xlsx = require("xlsx");
const path = require("path");

router.get("/export/excel", async (req, res) => {
  try {
    // Fetch all powder data
    const powderData = await Powder.find();
    
    // Format data for Excel
    const excelData = powderData.map(item => ({
      "Color Code": item.code,
      "Description": item.desc,
      "Quantity": item.qty,
      "Supplier": item.supplier,
      "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
      "Updated At": item.updatedAt ? new Date(item.updatedAt).toLocaleString() : ""
    }));
    
    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    
    // Set column widths
    const cols = [
      { wch: 15 }, // Color Code
      { wch: 30 }, // Description
      { wch: 10 }, // Quantity
      { wch: 15 }, // Supplier
      { wch: 20 }, // Created At
      { wch: 20 }  // Updated At
    ];
    worksheet["!cols"] = cols;
    
    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Powder Inventory");
    
    // Generate Excel buffer
    const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });
    
    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=powder_inventory.xlsx"
    );
    
    // Send the Excel file
    res.send(buffer);
  } catch (error) {
    console.log("Error exporting to Excel:", error);
    res.status(500).send({ code: 1, message: "Error exporting to Excel", error: error.message });
  }
});

module.exports = router;
