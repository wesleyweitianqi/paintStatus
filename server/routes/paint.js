var express = require("express");
var router = express.Router();
const Painted = require("../models/Painted");
const { createDocumentRegistry } = require("typescript");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const moment = require("moment-timezone");

router.get("/", async (req, res, next) => {
  try {
    const paintedList = await Painted.find().sort({ createdAt: -1 });
    res.send({ code: 0, data: paintedList });
  } catch (e) {
    console.log(e);
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
    const { deleteWo } = req.body;

    const list = await Painted.findOneAndDelete({ wo: deleteWo });
    res.send({ code: 0, data: list });
  } catch (e) {
    console.log(e);
  }
});

router.post("/savetoexcel", async (req, res) => {
  try {
    const filePath = "O:\\1. PERSONAL FOLDERS\\Wesley\\PaintRecord";
    const file = path.resolve(filePath, "painted.xlsx");
    let workbook;

    if (fs.existsSync(file)) {
      workbook = xlsx.readFile(file);
    } else {
      workbook = xlsx.utils.book_new();
    }

    // Set timezone to your local timezone (replace 'America/New_York' with your timezone)
    const timezone = "America/New_York";
    const startTime = moment.tz(moment(), timezone).startOf("day").toDate();
    const endTime = moment.tz(moment(), timezone).endOf("day").toDate();

    const list = await Painted.find({
      createdAt: {
        $gte: startTime,
        $lte: endTime,
      },
    });

    const appendData = list.map((item) => ({
      WO: item.wo,
      Description: item.description,
      Qty: item.qty,
      MovedTo: item.movedTo,
      Notes: item.notes,
      CreatedAt: moment(item.createdAt)
        .tz(timezone)
        .format("YYYY-MM-DD HH:mm:ss"), // Format date consistently
    }));

    const sheetName = "PaintedList";
    let worksheet = workbook.Sheets[sheetName];

    if (worksheet) {
      const existingData = xlsx.utils.sheet_to_json(worksheet);

      // Remove duplicates based on WO and CreatedAt
      const uniqueData = [...existingData, ...appendData].reduce(
        (acc, current) => {
          const x = acc.find(
            (item) =>
              item.WO === current.WO && item.CreatedAt === current.CreatedAt
          );
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        },
        []
      );

      worksheet = xlsx.utils.json_to_sheet(uniqueData);
    } else {
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
    xlsx.writeFile(workbook, file);

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

module.exports = router;
