const router = require('express').Router();
const HttpStatus = require('http-status-codes');

const UserCtrl = require('../../app/controllers/user');

router.post('/',
  async (req, res) => {
    try {
      const user = await UserCtrl.signUp(req.body);

      res.status(HttpStatus.CREATED).json(user);
    } catch (err) {
      console.log(err);
      res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  });

router.post('/login',
  async (req, res) => {
    try {
      const user = await UserCtrl.signIn(req.body);

      res.status(HttpStatus.OK).json(user);
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  });

router.post('/logout',
  async (req, res) => {
    try {
      res.status(HttpStatus.OK).json({ logout: true });
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  });

router.put('/diet/:dietId',
  async (req, res) => {
    try {
      const result = await UserCtrl.updateDiet(req.token.userId, req.params.dietId);

      res.status(HttpStatus.OK).json(result);
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  });

router.get('/calorie',
  async (req, res) => {
    try {
      const result = await UserCtrl.getCalorie(req.token.userId);

      res.status(HttpStatus.OK).json(result);
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  });

router.get('/',
  async (req, res) => {
    try {
      const result = await UserCtrl.getUser(req.token.userId);

      res.status(HttpStatus.OK).json(result);
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  });

router.put('/weight',
  async (req, res) => {
    try {
      const result = await UserCtrl.updateWeight(req.token.userId, req.body.weight);

      res.status(HttpStatus.OK).json(result);
    } catch (err) {
      res.status(HttpStatus.BAD_REQUEST).json(err);
    }
  });

router.post('/reset-password',
    async (req, res) => {
        try {
            await UserCtrl.resetPassword(req.body);

            res.status(HttpStatus.OK).send();
        } catch (err) {
            res.status(HttpStatus.BAD_REQUEST).json(err);
        }
    });

module.exports = router;
