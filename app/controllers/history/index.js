const models = require('../../models');

const HistoryCtrl = {
  listOfWeight(userId) {
    return models.WeightHistoryModel.findAll({ where: { userId }, raw: true });
  },

  listOfCalorie(userId) {
    return models.CalorieHistoryModel.findAll({ where: { userId }, raw: true });
  },
};

module.exports = HistoryCtrl;
