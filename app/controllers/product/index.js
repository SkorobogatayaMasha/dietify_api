const rp = require('request-promise');

const models = require('../../models');

const ProductInstanceCtrl = {
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
    }
};

module.exports = ProductInstanceCtrl;