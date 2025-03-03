const express = require("express");
const router = express.Router();
const CoreClamp = require("../models/coreclamp");
const { spawn } = require("child_process");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");
const moment = require("moment-timezone");
const TimeRecord = require("../models/timeRecord");

router.get("/list", async (req, res) => {
  console.log("get list");
  try {
    const result = await CoreClamp.find({ isComplete: false }).sort({
      updatedAt: -1,
    });
    if (result) {
      res.send({ code: 0, data: result });
      return;
    } else {
      res.send({ code: 1, data: false });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/finish", async (req, res) => {
  try {
    const { wo } = req.body;

    const result = await CoreClamp.findOneAndUpdate(
      { wo: wo },
      { isComplete: true },
      { new: true }
    );

    if (result) {
      res.send({ code: 0, data: result });
    } else {
      res.send({ code: 1, data: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ code: 1, message: err });
  }
});

router.get("/todaycomplete", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await CoreClamp.find({
      isComplete: true,
      updatedAt: { $gte: today },
    }).sort({ updatedAt: -1 });

    res.send({ code: 0, data: result });
  } catch (err) {
    res.status(500).send({ code: 1, message: err });
  }
});

router.get("/completed", async (req, res) => {
  try {
    const thisyear = new Date().getFullYear();
    const startOfYear = new Date(thisyear, 0, 1);
    const result = await CoreClamp.find({
      isComplete: true,
      updatedAt: { $gte: startOfYear },
    });
    if (result) {
      res.send({ code: 0, data: result });
      return;
    } else {
      res.send({ code: 1, data: false });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/search", async (req, res) => {
  try {
    const { wo } = req.body;
    const result = await CoreClamp.findOne({ wo: wo });
    if (result) {
      res.send({ code: 0, data: result });
      return;
    } else {
      res.send({ code: 1, data: false });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/cancel", async (req, res) => {
  try {
    const { wo } = req.body;
    const result = await CoreClamp.findOneAndUpdate(
      { wo: wo },
      { isComplete: false },
      { new: true }
    );

    if (result) {
      res.send({ code: 0, data: true });
    } else {
      res.send({ code: 1, data: false });
    }
  } catch (err) {
    res.status(500).send({ code: 1, message: err });
  }
});

router.post("/submit", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const entries = Object.entries(data);
    const chunkarray = [];
    let tempObject = {};
    entries.forEach(([key, value], index) => {
      tempObject[key] = value;
      if ((index + 1) % 6 === 0 || index === entries.length - 1) {
        chunkarray.push(tempObject);
        tempObject = {};
      }
    });

    const savedData = chunkarray.map((item) => {
      const wo = Object.keys(item)[0].split("_")[0];

      return [
        new Date().toISOString().substring(0, 10),
        wo,
        item[`${wo}_start`],
        item[`${wo}_end`],
        item[`${wo}_switch1`] === "undefined" ? false : item[`${wo}_switch1`],
        item[`${wo}_switch2`] === "undefined" ? false : item[`${wo}_switch2`],
        item[`${wo}_switch3`] === "undefined" ? false : item[`${wo}_switch3`],
        item[`${wo}_comment`] === "undefined" ? "" : item[`${wo}_comment`],
      ];
    });
    console.log(savedData);
    const pythonProcess = spawn("python", ["addData.py"]);
    pythonProcess.stdin.write(JSON.stringify(savedData));
    pythonProcess.stdin.end();

    let output = "";
    let errorOutput = "";

    // Capture output from the Python script
    pythonProcess.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    // Capture errors from the Python script
    pythonProcess.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
    });

    // Handle script completion
    pythonProcess.on("close", (code) => {
      if (code === 0) {
        res.json({ message: "Data appended successfully", output });
      } else {
        console.log(errorOutput);
        res
          .status(500)
          .json({ error: "Failed to append data", details: errorOutput });
      }
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: error.message });
  }
});

router.post("/savetoexcel", async (req, res) => {
  try {
    const filePath = "O:\\1. PERSONAL FOLDERS\\Wesley\\PaintRecord";
    const file = path.resolve(filePath, "coreclamps.xlsx");
    let workbook;

    if (fs.existsSync(file)) {
      workbook = xlsx.readFile(file);
    } else {
      workbook = xlsx.utils.book_new();
    }

    const timezone = "America/New_York";
    const today = moment.tz(moment(), timezone).startOf("day");
    const appendData = req.body.map((item) => ({
      WO: item.wo,
      Quantity: item.qty,
      CompletedTime: moment(item.updatedAt)
        .tz(timezone)
        .format("YYYY-MM-DD HH:mm:ss"),
      Comment: item.comment,
    }));

    const sheetName = "Sheet1";
    let worksheet = workbook.Sheets[sheetName];

    if (worksheet) {
      let existingData = xlsx.utils.sheet_to_json(worksheet);
      existingData = existingData.filter((row) => {
        const rowDate = moment.tz(
          row.CompletedTime,
          "YYYY-MM-DD HH:mm:ss",
          timezone
        );
        return !rowDate.isSame(today, "day");
      });
      console.log(existingData);
      const newData = existingData.concat(appendData);
      console.log("🚀 ~ router.post ~ newData:", newData);
      worksheet = xlsx.utils.json_to_sheet(newData);
    } else {
      worksheet = xlsx.utils.json_to_sheet(appendData);
    }

    // Add column width specifications
    const cols = [
      { wch: 15 }, // WO
      { wch: 10 }, // Quantity
      { wch: 20 }, // CompletedTime
      { wch: 40 }, // Comment
    ];

    worksheet["!cols"] = cols;
    workbook.Sheets[sheetName] = worksheet;

    // To avoid loading error while file is open, add timestamp
    // const newFile = path.resolve(filePath, `coreclamps_${Date.now()}.xlsx`);

    xlsx.writeFile(workbook, file);

    res.send({ code: 0, message: "Excel file saved successfully" });
  } catch (e) {
    console.log(e);
    res.send({ code: 1, message: "Error saving Excel file", error: e.message });
  }
});

router.post("/saveTimeRecords", async (req, res) => {
  const { startTime, endTime } = req.body;
  const timeRecord = new TimeRecord({ startTime, endTime });
  await timeRecord.save();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  const list = await TimeRecord.find({
    startTime: { $gte: today, $lte: endOfDay },
    endTime: { $gte: today, $lte: endOfDay },
  });
  res.send({ code: 0, message: "Time record saved successfully", data: list });
});

router.get("/getTimeRecords", async (req, res) => {
  //i want to get start of day and end of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const timeRecords = await TimeRecord.find({
      startTime: { $gte: today, $lte: endOfDay },
      endTime: { $gte: today, $lte: endOfDay },
    });
    console.log("🚀 ~ router.get ~ timeRecords:", timeRecords);
    res.send({ code: 0, data: timeRecords });
  } catch (error) {
    console.error(error);
    res.status(500).send({ code: 1, message: "Error fetching time records" });
  }
});

module.exports = router;
