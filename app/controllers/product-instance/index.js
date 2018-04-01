const _ = require('lodash');
const Op = require('sequelize').Op;
const rp = require('request-promise');
const moment = require('moment');

const models = require('../../models');

const ProductInstanceCtrl = {
  async create(userId, productInstance) {
    let findProduct = await models.ProductModel.findOne({
      where: {
        code: Number(productInstance.code),
      },
    });

    // if (!findProduct) {
      const res = await rp(`https://world.openfoodfacts.org/api/v0/product/${productInstance.code}.json`);
      const productInfo = JSON.parse(res);
      const name = _.get(productInfo, 'product.product_name');

      if (!findProduct)
      findProduct = await models.ProductModel.create({ code: productInstance.code, name }, { returning: true });
    // }

    await models.ProductInstanceModel.create({
      productId: findProduct.id,
      userId,
    });

    return productInfo;

    // return models.ProductInstanceModel.findAll({
    //   where: {
    //     userId,
    //   },
    //   raw: true,
    // });
  },
};

module.exports = ProductInstanceCtrl;
