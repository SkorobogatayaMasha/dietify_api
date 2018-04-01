const _ = require('lodash');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const sequelize = require('../../../database/sequelize');

const models = require('../../models');

const UserCtrl = {
  async signUp(user) {
    return sequelize.transaction(async (t) => {
      const createUser = await models.UserModel.create(user, { returning: true, transaction: t });
      const userJson = createUser.toJSON();
      delete userJson.password;
      const token = jwt.sign({ userId: userJson.id }, process.env.JWT_SICRET);
      await models.WeightHistoryModel.create({ userId: userJson.id, weight: userJson.weight }, { transaction: t });

      return { user: userJson, token };
    });
  },

  async getUser(userId) {
    const user = await models.UserModel.findById(userId);
    const userJSON = user.toJSON();
    delete userJSON.password;

    return userJSON;
  },

  async signIn(user) {
    const { email, password } = user;
    const findUser = await models.UserModel.findOne({ where: { email } });
    const userJson = findUser ? findUser.toJSON() : {};

    if (!passwordHash.verify(password, userJson.password)) {
      throw { message: 'Email or password incorrect.' };
    }
    delete userJson.password;
    const token = jwt.sign({ userId: userJson.id }, process.env.JWT_SICRET);

    return { user: userJson, token };
  },

  async updateDiet(userId, dietId) {
    await models.UserModel.update({ dietId }, { where: { id: userId }, hooks: false });
    const user = await models.UserModel.findById(userId);
    const userJSON = user.toJSON();
    delete userJSON.password;

    return userJSON;
  },

  async getCalorie(userId) {
    const user = await models.UserModel.findById(userId);
    const userJSON = user.toJSON();
    const bx = this.calculateBX(userJSON);

    const dietCharacteristics = models.UserModel.DIET_CHARACTERISTICS[userJSON.dietId];

    return {
      dietCharacteristics,
      calorie: {
        total: this.calculateCalorie(userJSON, bx),
        used: 0,
      },
      dashboard: {
        proteins: {
          total: 100,
          used: 0,
        },
        fats: {
          total: 100,
          used: 0,
        },
        carbohydrates: {
          total: 100,
          used: 0,
        },
      }
    };
  },

  async updateWeight(userId, weight) {
    await sequelize.transaction(async (t) => {
      await models.UserModel.update({ weight }, { where: { id: userId }, transaction: t, hooks: false });
      await models.WeightHistoryModel.create({ userId, weight }, { transaction: t });
    });

    const user = (await models.UserModel.findById(userId)).toJSON();
    delete user.password;

    return user;
  },

  calculateBX(user) {
    const { weight, growth, dateOfBirth, gender } = user;
    const age = moment.utc().diff(moment(dateOfBirth), 'years');
    const isMen = gender === models.UserModel.GENDER_TYPE.MEN;

    return (10 * weight) + (6.25 * growth) - (5 * age) + (isMen ? 5 : -161);
  },

  calculateCalorie(user, bx) {
    switch (user.lifestyle) {
      case models.UserModel.LIFESTYLE.VERY_HIGH_ACTIVITY:
        return bx * 1.9;
      case models.UserModel.LIFESTYLE.HIGH_ACTIVITY:
        return bx * 1.725;
      case models.UserModel.LIFESTYLE.AVERAGE_ACTIVITY:
        return bx * 1.55;
      case models.UserModel.LIFESTYLE.SLIGHT_ACTIVITY:
        return bx * 1.375;
      case models.UserModel.LIFESTYLE.PASSIVE:
      default:
        return bx * 1.2;
    }
  },
};

module.exports = UserCtrl;
