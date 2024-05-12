const express = require("express");
const router = express.Router();
const CoreClamp = require("../models/coreclamp");

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

module.exports = router;
