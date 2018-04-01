module.exports = (models) => ({
  beforeValidate: require('./before-validate')(models),
});
