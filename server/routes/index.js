var express = require('express');
var router = express.Router();
const Status = require('../models/paintStatus');

/* GET home page. */
router.get('/', async (req, res, next) => {
  res.render('index', { title: 'Express' });
});

router.post("/", async (req, res, next) => {
  
})

module.exports = router;
