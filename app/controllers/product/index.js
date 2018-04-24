const Promise = require('bluebird');
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

    async create(payload) {
        const { schedules, ...product } = payload;
        const productInstance = await models.ProductModel.create(product, { returning: true, raw: true });

        await Promise.each(schedules, async schedule => {
            console.log(schedule);
            await models.ProductScheduleModel.create({
                productId: productInstance.toJSON().id,
                scheduleId: schedule,
            });
        });

        return productInstance;
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
        const products = await models.ProductModel.findAll({
            include: {
                attributes: [],
                model: models.ProductScheduleModel,
                required: true,
                where: {
                    scheduleId,
                },
            },
            where: {
                dietId: user.dietId,
            },
            raw: true,
        });

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
            result.proteins += instance.product.proteins * instance.count;
            result.fats += instance.product.fats * instance.count;
            result.carbohydrates += instance.product.carbohydrates * instance.count;
        });

        const calorie = await CalorieService.getCalorie(userId);

        const categories = {};
        Object.keys(calorie.dashboard).forEach((key, index) => {
            console.log(key);
            categories[`k${index}`] = 100 - (calorie.dashboard[key].used * 100 / calorie.dashboard[key].total);
        });

        const matrix = [];
        Object.values(categories).forEach(categoryA => {
            const array = [];
            Object.values(categories).forEach(categoryB => {
                if (categoryA === categoryB) {
                    array.push(1);
                } else if (categoryA > categoryB) {
                    const x = ((categoryA - categoryB) * 100) / categoryA;
                    if (x <= 25) {
                        array.push(3);
                    } else if (x <= 50) {
                        array.push(5);
                    } else if (x <= 75) {
                        array.push(7);
                    } else {
                        array.push(9);
                    }
                } else {
                    const x = ((categoryB - categoryA) * 100) / categoryB;
                    if (x <= 25) {
                        array.push(1/3);
                    } else if (x <= 50) {
                        array.push(1/5);
                    } else if (x <= 75) {
                        array.push(1/7);
                    } else {
                        array.push(1/9);
                    }
                }
            });

            matrix.push(array);
        });

        const avgGem = {};
        matrix.forEach((array, index) => {
            array.forEach((item) => {
                if (!avgGem[`k${index}`]) {
                    avgGem[`k${index}`] = 1;
                }
                avgGem[`k${index}`] *= item;
            });
            avgGem[`k${index}`] = Math.cbrt(avgGem[`k${index}`]);
        });

        let total = 0;
        Object.values(avgGem).forEach(value => total += value);

        const h = {};
        Object.values(avgGem).forEach((item, index) => {
            h[`k${index}`] = item / total;
        });

        let checkH = 0;
        Object.values(h).forEach(item => checkH += item);

        const categoryAvg = {};
        matrix.forEach(array => {
            array.forEach((item, index) => {
                if (!categoryAvg[`k${index}`]) {
                    categoryAvg[`k${index}`] = 0;
                }
                categoryAvg[`k${index}`] += item;
            });
        });

        let categoryAvgSum = 0;
        Object.values(categoryAvg).forEach(item => categoryAvgSum += item);

        // const lambda = {};
        // Object.values(categoryAvg).forEach((item, index) => {
            // lambda[`k${index}`] = h[`k${index}`] * categoryAvg[`k${index}`];
        // });

        // let lambdaMax = 0;
        // Object.values(lambda).forEach(item => lambdaMax += item);

        // const n = Object.values(lambda).length;
        // const is = (lambdaMax - n) / (n - 1);

        // const ss = 0.58; // constant value
        // const os = is / ss * 100;

        const weightCriteries = {};
        Object.values(categoryAvg).forEach((item, index) => {
            weightCriteries[`k${index}`] = categoryAvg[`k${index}`] / categoryAvgSum;
        });

        const alternatives = [];
        products.forEach(product => {
            const array = [];
            Object.values(weightCriteries).forEach((weightCritery, index) => {
                switch (index) {
                    case 0:
                        array.push({ ...product, value: product.proteins });
                        break;
                    case 1:
                        array.push({ ...product, value: product.fats });
                        break;
                    case 2:
                        array.push({ ...product, value: product.carbohydrates });
                        break;
                }
            });

            alternatives.push(array);
        });

        const weightAlternatives = [];
        alternatives.forEach((array) => {
            let weightAlternative = 0;
            let product = {};
            array.forEach((item, index) => {
                weightAlternative += item.value * weightCriteries[`k${index}`];
                product = item;
            });

            weightAlternatives.push({ ...product, value: weightAlternative });
        });

        return weightAlternatives.sort((a, b) => a.value < b.value ? 1 : -1);
    },
};

module.exports = ProductCtrl;
