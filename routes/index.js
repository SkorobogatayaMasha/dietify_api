const router = require('express').Router();

console.info('Defining routes.');

router.use('/history', require('./history'));
router.use('/product', require('./product'));
router.use('/product-instance', require('./product-instance'));
router.use('/user', require('./user'));

module.exports = router;
