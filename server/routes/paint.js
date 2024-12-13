var express = require("express");
var router = express.Router();
const Painted = require("../models/Painted");

router.get("/", async (req, res, next) => {
  try {
    const paintedList = await Painted.find();
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
    const list = await Painted.find();
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

module.exports = router;
