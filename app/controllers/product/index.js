const rp = require('request-promise');
const moment = require('moment');
const Op = require('sequelize').Op;

const models = require('../../models');
const CalorieService = require('../../services/calorie');

const ProductCtrl = {
    async getBarcodeInfo(barcode) {
        const res = await rp(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);

        return JSON.parse(res);
    },

    listOfFood(userId) {
        const user = models.UserModel.findById(userId);

        return models.ProductModel.findAll({
            where: {
                dietId: user.dietId,
            },
        })
    },

    async menu(userId, scheduleId) {
        const user = await models.UserModel.findById(userId);
        // const products = await models.ProductModel.findAll({
        //     include: {
        //         model: models.ProductScheduleModel,
        //         required: true,
        //         where: {
        //             scheduleId,
        //         }
        //     },
        // });

        const productInstances = await models.ProductInstanceModel.findAll({
            include: {
                model: models.ProductModel,
                required: true,
            },
            where: {
                userId,
                createdAt: {
                    [Op.gte]: moment().format('L'),
                },
            },
        });

        const diet = models.UserModel.DIET_CHARACTERISTICS[user.dietId];
        // console.log(diet);

        const result = {
            proteins: 0,
            fats: 0,
            carbohydrates: 0,
        };
        productInstances.forEach(instance => {
            result.proteins += instance.product.proteins * instance.count;
            result.fats += instance.product.fats * instance.count;
            result.carbohydrates += instance.product.carbohydrates * instance.count;
        });

        const calorie = await CalorieService.getCalorie(userId);

        console.log(result);
        console.log(calorie);

        return productInstances;
    },
};

module.exports = ProductCtrl;
