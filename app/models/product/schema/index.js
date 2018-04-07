const DataTypes = require('sequelize').DataTypes;

const CONSTANTS = require('../constants');

const DEFINITION_OBJECT = {
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dietId: {
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
