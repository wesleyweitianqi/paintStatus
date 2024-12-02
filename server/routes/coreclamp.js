const express = require("express");
const router = express.Router();
const CoreClamp = require("../models/coreclamp");
const { spawn } = require("child_process");

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
      { isComplete: true }
    );
    if (result) {
      res.send({ code: 0, data: true });
      return;
    } else {
      res.send({ code: 1, data: false });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/todaycomplete", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await CoreClamp.find({
      isComplete: true,
      updatedAt: { $gte: today },
    });
    if (result) {
      res.send({ code: 0, data: result });
      return;
    } else {
      res.send({ code: 1, data: false });
    }
  } catch (err) {
    res.status(500).send({ code: 1, message: err });
  }
});

router.get("/completed", async (req, res) => {
  try {
    const result = await CoreClamp.find({ isComplete: true });
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
      { isComplete: false }
    );
    if (result) {
      res.send({ code: 0, data: true });
      return;
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
    const pythonProcess = spawn("python3", ["addData.py"]);
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

module.exports = router;
