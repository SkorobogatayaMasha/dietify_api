const _ = require('lodash');

const sequelize = require('../../database/sequelize');

const models = {
  CalorieHistoryModel: require('./calorie-history'),
  ProductModel: require('./product'),
  ProductInstanceModel: require('./product-instance'),
  UserModel: require('./user'),
  WeightHistoryModel: require('./weight-history'),
};

const definedModels = _.mapValues(models, ({ constants, schema, establishRelations, hooks }) => {
  const model = sequelize.define(
    constants.MODEL,
    schema.definitionObject,
    schema.configurationObject,
  );

  return Object.assign(model, constants, { establishRelations, hooks });
});

Object.values(definedModels).forEach(model => {
  const hooks = model.hooks(definedModels);
  Object.keys(hooks).forEach(key => model.hook(key, hooks[key][0]));
});
Object.values(definedModels).forEach(model => model.establishRelations(definedModels));

module.exports = definedModels;