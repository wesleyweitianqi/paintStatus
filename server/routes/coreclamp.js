const express = require("express");
const router = express.Router();
const CoreClamp = require("../models/coreclamp");

router.get("/list", async (req, res) => {
  try {
    const result = await CoreClamp.find({ isComplete: true }).sort({
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
  res.send({ code: 0, message: "hello world!" });
});

module.exports = router;
