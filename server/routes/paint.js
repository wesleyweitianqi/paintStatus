var express = require('express');
var router = express.Router();
const Status = require('../models/paintStatus');

router.get('/', async (req, res, next) => {
    try{
      const paintedList = await Status.find();
      console.log("🚀 ~ router.get ~ paintedList:", paintedList)
      console.log(paintedList);
      res.send({code:0, data: paintedList});
    }catch(e){
      console.log(e);
    }
  });
  
  router.post("/", async (req, res, next) => {
    try{
      const { wo, isPainted } = req.body;
      const paintedWo =await new Status({
        wo: wo,
        painted: isPainted
      })
      paintedWo.save();
      const list = await Status.find();
      res.send({code: 0, data: list});
  
    }catch(e){
      console.log(e);
    }
  })

module.exports = router;