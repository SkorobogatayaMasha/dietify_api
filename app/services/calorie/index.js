const moment = require('moment');
const Op = require('sequelize').Op;

const models = require('../../models');

const CalorieService = {
    async getCalorie(userId) {
        const user = await models.UserModel.findById(userId);
        const userJSON = user.toJSON();
        const bx = this.calculateBX(userJSON);

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

        const result = {
            proteins: 0,
            fats: 0,
            carbohydrates: 0,
        };
        productInstances.forEach(instance => {
            result.proteins += instance.product.proteins * instance.count / 100;
            result.fats += instance.product.fats * instance.count / 100;
            result.carbohydrates += instance.product.carbohydrates * instance.count / 100;
        });

        const calorieTotal = this.calculateCalorie(userJSON, bx);
        const usedCalories = (result.proteins * 4.1) + (result.fats * 9.3) + (result.carbohydrates * 4.1);
        const dietCharacteristics = models.UserModel.DIET_CHARACTERISTICS[userJSON.dietId];

        const totalProteins = calorieTotal * 0.2 / 4.1;
        const totalFats = calorieTotal * 0.3 / 9.3;
        const totalCarbohydrates = calorieTotal * 0.5 / 4.1;

        return {
            dietCharacteristics,
            calorie: {
                total: this.calculateCalorie(userJSON, bx),
                used: usedCalories,
            },
            dashboard: {
                proteins: {
                    total: totalProteins,
                    used: result.proteins,
                },
                fats: {
                    total: totalFats,
                    used: result.fats,
                },
                carbohydrates: {
                    total: totalCarbohydrates,
                    used: result.carbohydrates,
                },
            }
        };
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

module.exports = CalorieService;
