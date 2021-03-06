const DataTypes = require('sequelize').DataTypes;

const CONSTANTS = require('../constants');

const DEFINITION_OBJECT = {
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    productId: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    scheduleId: {
        type: DataTypes.BIGINT,
        allowNull: false,
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
