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
module.exports = router;
