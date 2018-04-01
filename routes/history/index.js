const router = require('express').Router();
const HttpStatus = require('http-status-codes');

const HistoryCtrl = require('../../app/controllers/history');

router.get('/weight',
  async (req, res) => {
    try {
      const result = await HistoryCtrl.listOfWeight(req.token.userId);

      res.status(HttpStatus.OK).json(result);
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  });

router.get('/calorie',
  async (req, res) => {
    try {
      const result = await HistoryCtrl.listOfCalorie(req.token.userId);

      res.status(HttpStatus.OK).json(result);
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  });

module.exports = router;
