const express = require("express");
const Bend = require("../models/bend");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bendList = await Bend.find({ createdAt: { $gte: today } });

    res.send({ code: 0, data: bendList });
  } catch (e) {
    console.log(e);
  }
});

router.post("/", async (req, res) => {
  try {
    const newBend = new Bend(req.body);
    console.log("🚀 ~ router.post ~ newBend:", newBend);
    await newBend.save();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bendList = await Bend.find({ createdAt: { $gte: today } });
    res.send({ code: 0, data: bendList });
  } catch (e) {
    console.log(e);
    res.send({
      code: 1,
      message: "Error creating bend record",
      error: e.message,
    });
  }
});

router.post("/delete", async (req, res) => {
  try {
    const { wo } = req.body;
    console.log("🚀 ~ router.post ~ wo:", wo);
    const result = await Bend.findOneAndDelete({ wo: wo });
    if (result) {
      res.send({ code: 0, data: true });
    } else {
      res.send({ code: 1, data: false });
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
