var express = require("express");
var router = express.Router();
const Painted = require("../models/painted.js");
const { createDocumentRegistry } = require("typescript");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const moment = require("moment-timezone");
const PaintPriority = require("../models/paintPriority");
router.get("/", async (req, res, next) => {
  try {
    const paintedList = await Painted.find().sort({ createdAt: -1 });
    res.send({ code: 0, data: paintedList });
  } catch (e) {
    console.log(e);
  }
});

// search painted by work order (partial, case-insensitive)
router.get("/search", async (req, res) => {
  try {
    const { wo } = req.query;
    const query = wo
      ? { wo: { $regex: wo, $options: "i" } }
      : {};
    const list = await Painted.find(query).sort({ updatedAt: -1 });
    res.send({ code: 0, data: list });
  } catch (e) {
    console.log(e);
    res.send({ code: 1, data: [] });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { wo, description, qty, movedTo, notes } = req.body;
    const paintedWo = await new Painted({
      wo: wo,
      description: description,
      qty: qty,
      movedTo: movedTo,
      notes: notes,
      complete: true,
    });
    await paintedWo.save();
    const list = await Painted.find().sort({ createdAt: -1 });
    res.send({ code: 0, data: list });
  } catch (e) {
    console.log(e);
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    const { wo } = req.body;
    console.log("🗑️ Deleting work order:", wo);
    
    const result = await Painted.findOneAndDelete({ wo: wo });
    
    if (result) {
      console.log("✅ Successfully deleted from Painted collection:", result);
      res.send({ code: 0, message: "Work order deleted successfully", data: result });
    } else {
      console.log("❌ No document found with wo:", wo);
      res.send({ code: 1, message: "Work order not found" });
    }
  } catch (e) {
    console.log("❌ Error in delete:", e);
    res.send({ code: 1, message: "Error deleting work order", error: e.message });
  }
});

router.post("/savetoexcel", async (req, res) => {
  try {
    ;
    const file = path.resolve(__dirname, "..", "painted.xlsx");
    let workbook;

    const timezone = "America/New_York";
    const today = moment.tz(moment(), timezone).startOf("day");
    const endOfDay = moment.tz(moment(), timezone).endOf("day");

    // Get today's data from database
    const todaysList = await Painted.find({
      createdAt: {
        $gte: today.toDate(),
        $lte: endOfDay.toDate(),
      },
    });

    const appendData = todaysList.map((item) => ({
      WO: item.wo,
      Description: item.description,
      Qty: item.qty,
      MovedTo: item.movedTo,
      Notes: item.notes,
      CreatedAt: moment(item.createdAt)
        .tz(timezone)
        .format("YYYY-MM-DD HH:mm:ss"),
    }));

    // Read existing workbook or create new one
    if (fs.existsSync(file)) {
      workbook = xlsx.readFile(file);
    } else {
      workbook = xlsx.utils.book_new();
    }

    const sheetName = "Sheet1";
    let worksheet = workbook.Sheets[sheetName];


    if (worksheet) {
      // Convert existing worksheet to JSON
      let existingData = xlsx.utils.sheet_to_json(worksheet);

      // Remove today's data from existing data
      existingData = existingData.filter(row => {
        const rowDate = moment.tz(row.CreatedAt, "YYYY-MM-DD HH:mm:ss", timezone);
        return !rowDate.isSame(today, 'day');
      });
      // Combine existing data with today's data
      const uniqueData = [...existingData, ...appendData];
      worksheet = xlsx.utils.json_to_sheet(uniqueData);
    } else {
      // If no worksheet exists, create new one with today's data
      worksheet = xlsx.utils.json_to_sheet(appendData);
    }

    // Add column width specifications
    const cols = [
      { wch: 15 }, // WO
      { wch: 30 }, // Description
      { wch: 10 }, // Qty
      { wch: 15 }, // MovedTo
      { wch: 30 }, // Notes
      { wch: 20 }, // CreatedAt
    ];

    worksheet["!cols"] = cols;
    workbook.Sheets[sheetName] = worksheet;

    //to avoid loading error while file is open, add timestamp

    
    const filePath1 = path.resolve(__dirname, "..", "painted.xlsx");
    console.log(filePath1);
    // const newFile = path.resolve(filePath1, `painted.xlsx`);

    xlsx.writeFile(workbook, filePath1);

    res.send({ code: 0, message: "Excel file saved successfully" });
  } catch (e) {
    console.log(e);
    res.send({ code: 1, message: "Error saving Excel file", error: e.message });
  }
});

let currentPaint = "ASA61 GREY";

router.get("/currentpaint", async (req, res) => {
  try {
    res.send({ code: 0, data: currentPaint });
  } catch (e) {
    console.log(e);
  }
});

//this api will save the job done on a particular date to the excel file
router.get("/savetoexcel/:date", async (req, res) => {
  try {
    const file = path.resolve(__dirname, "..", "painted.xlsx");
    const date = req.params.date;
    console.log(date);
    const today = moment(date).startOf("day");
    const endOfDay = moment(date).endOf("day");
    let workbook;
    
    // Get today's data from database
    const todaysList = await Painted.find({
      createdAt: {
        $gte: today.toDate(),
        $lte: endOfDay.toDate(),
      },
    });
    const appendData = todaysList.map((item) => ({
      WO: item.wo,
      Description: item.description,
      Qty: item.qty,
      MovedTo: item.movedTo,
      Notes: item.notes,
      CreatedAt: moment(item.createdAt)
       .tz("America/New_York")
       .format("YYYY-MM-DD HH:mm:ss"),
    }));
    // Read existing workbook or create new one
    if (fs.existsSync(file)) {
      workbook = xlsx.readFile(file);
    } else {
      workbook = xlsx.utils.book_new();
    }
    const sheetName = "Sheet1";
    let worksheet = workbook.Sheets[sheetName];
    if (worksheet) {
      // Convert existing worksheet to JSON
      let existingData = xlsx.utils.sheet_to_json(worksheet);
      // Remove today's data from existing data
      existingData = existingData.filter(
        (row) =>
         !moment.tz(row.CreatedAt, "YYYY-MM-DD HH:mm:ss", "America/New_York")
           .isSame(today, "day")
      );
      // Combine existing data with today's data
      const uniqueData = [...existingData,...appendData];
      worksheet = xlsx.utils.json_to_sheet(uniqueData);
    } else {
      // If no worksheet exists, create new one with today's data
      worksheet = xlsx.utils.json_to_sheet(appendData);
    }
    // Add column width specifications
    const cols = [
      { wch: 15 }, // WO
      { wch: 30 }, // Description
      { wch: 10 }, // Qty
      { wch: 15 }, // MovedTo
      { wch: 30 }, // Notes
      { wch: 20 }, // CreatedAt
    ];
    worksheet["!cols"] = cols;
    workbook.Sheets[sheetName] = worksheet;
    //to avoid loading error while file is open, add timestamp
    const filePath1 = path.resolve(__dirname, "..", "painted.xlsx");
    console.log(filePath1);
    // const newFile = path.resolve(filePath1, `painted.xlsx`);
    xlsx.writeFile(workbook, filePath1);
    res.send({ code: 0, message: "Excel file saved successfully" });
  } catch (e) {
    console.log(e);
    res.send({ code: 1, message: "Error saving Excel file", error: e.message });
  }
});


router.post("/currentpaint", async (req, res) => {
  try {
    const { paint } = req.body;
    currentPaint = paint;
    res.send({ code: 0, message: "Current paint updated successfully" });
  } catch (e) {
    console.log(e);
    res.send({
      code: 1,
      message: "Error updating current paint",
      error: e.message,
    });
  }
});

let schedule = {
  Monday: "ASA61 GREY",
  Tuesday: "ASA61 GREY",
  Wednesday: "ASA61 GREY",
  Thursday: "ASA61 GREY",
  Friday: "ASA61 GREY",
};

router.get("/schedule", async (req, res) => {
  try {
    res.send({ code: 0, data: schedule });
  } catch (e) {
    console.log(e);
  }
});

router.post("/schedule", async (req, res) => {
  try {
    const newSchedule = req.body;
    Object.keys(newSchedule).forEach((key) => {
      schedule[key] = newSchedule[key];
    });
    res.send({ code: 0, message: "Schedule updated successfully" });
  } catch (e) {
    console.log(e);
  }
});

router.get("/getpaintjob", async (req, res) => {
  try {
    const paintJobs = await PaintPriority.find({ complete: false }).exec();
    res.send({ code: 0, data: paintJobs });
  } catch (e) {
    console.log(e);
  }
});

router.post("/updatepaintjob", async (req, res) => {
  try {
    const { wo } = req.body;
    console.log("🚀 ~ router.post ~ wo:", wo);
    const result = await PaintPriority.findOneAndUpdate(
      { wo: wo },
      { $set: { complete: true } }, // Make sure field name matches your schema
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      }
    );
    if (result) {
      //insert the result into painted
      const painted = await new Painted({
        wo: result.wo,
        description: result.description,
        qty: result.qty,
        movedTo: result.movedTo,
        notes: result.notes,
        complete: true,
      });
      await painted.save();
      const paintJobs = await PaintPriority.find({ complete: false }).exec();
      res.send({
        code: 0,
        message: "Paint job updated successfully",
        data: paintJobs,
      });
    } else {
      res.send({ code: 1, message: "Paint job not found" });
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/changeorder", async (req, res) => {
  try {
    console.log("🔥 POST /changeorder route hit!");
    console.log("🔥 Request method:", req.method);
    console.log("🔥 Request body:", req.body);
    
    const { wo, ...updateData } = req.body;
    console.log("🚀 ~ router.post ~ wo:", wo, "updateData:", updateData);
    
    // Update the Painted collection with all provided fields
    const result = await Painted.findOneAndUpdate(
      { wo: wo },
      { $set: updateData },
      { new: true }
    );
    
    if (result) {
      console.log("✅ Successfully updated Painted collection:", result);
      res.send({ code: 0, message: "Painted part updated successfully", data: result });
    } else {
      console.log("❌ No document found with wo:", wo);
      res.send({ code: 1, message: "Work order not found" });
    }
  } catch (e) {
    console.log("❌ Error in changeorder:", e);
    res.send({ code: 1, message: "Error updating painted part", error: e.message });
  }
});

module.exports = router;
