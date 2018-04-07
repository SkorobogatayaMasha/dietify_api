const Op = require('sequelize').Op;
const moment = require('moment');

const models = require('../../models');

const ProductInstanceCtrl = {
    async create(userId, instance) {
        const { productId, count } = instance;
        return models.ProductInstanceModel.create({ userId, productId, count });
    },

    listOfFood(userId) {
        return models.ProductInstanceModel.findAll({
            include: {
               model: models.ProductModel,
               required: true,
            },
            where: {
                userId,
                createdAt: {
                    [Op.gte]: moment().format('L'),
                }
            },
        })
    }
};

module.exports = ProductInstanceCtrl;