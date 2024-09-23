const express = require("express");
const router = express.Router();
const Shear = require("../models/Shear");

router.post("/", async (req, res) => {
  try {
    const shear = new Shear(req.body);
    await shear.save();
    res.status(201).json(shear);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const shears = await Shear.find().sort({ timestamp: -1 });
    res.json(shears);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
