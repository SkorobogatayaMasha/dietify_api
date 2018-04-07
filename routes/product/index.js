const router = require('express').Router();
const HttpStatus = require('http-status-codes');

const ProductCtrl = require('../../app/controllers/product');

router.get('/barcode/:barcode',
    async (req, res) => {
        try {
            const result = await ProductCtrl.getBarcodeInfo(req.params.barcode);

            res.status(HttpStatus.OK).json(result);
        } catch (err) {
            res.status(HttpStatus.BAD_REQUEST).json(err);
        }
    });

router.get('/',
    async (req, res) => {
        try {
            const result = await ProductCtrl.listOfFood(req.token.userId);

            res.status(HttpStatus.OK).json(result);
        } catch (err) {
            res.status(HttpStatus.BAD_REQUEST).json(err);
        }
    });


module.exports = router;
