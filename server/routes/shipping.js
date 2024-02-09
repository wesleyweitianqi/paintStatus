var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/shipping/:wo", function (req, res, next) {
  console.log(req.params);
});

module.exports = router;
