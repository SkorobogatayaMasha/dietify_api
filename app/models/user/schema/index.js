const DataTypes = require('sequelize').DataTypes;

const CONSTANTS = require('../constants');

const DEFINITION_OBJECT = {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  growth: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dietId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lifestyle: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
};

const CONFIGURATION_OBJECT = {
  tableName: CONSTANTS.MODEL,
  timestamps: true,
};

module.exports = Object.freeze({
  definitionObject: DEFINITION_OBJECT,
  configurationObject: CONFIGURATION_OBJECT,
});
