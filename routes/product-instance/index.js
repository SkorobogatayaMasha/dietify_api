const router = require('express').Router();
const HttpStatus = require('http-status-codes');

const ProductInstanceCtrl = require('../../app/controllers/product-instance');

router.post('/',
  async (req, res) => {
    try {
      const result = await ProductInstanceCtrl.create(req.token.userId, req.body);

      res.status(HttpStatus.OK).json(result);
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  });

router.get('/',
    async (req, res) => {
        try {
            const result = await ProductInstanceCtrl.listOfFood(req.token.userId);

            res.status(HttpStatus.OK).json(result);
        } catch (err) {
            res.status(HttpStatus.BAD_REQUEST).json(err);
        }
    });


module.exports = router;
