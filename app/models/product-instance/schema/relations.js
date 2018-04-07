module.exports = (models) => {
    models.ProductInstanceModel.belongsTo(models.ProductModel, { foreignKey: 'productId', targetKey: 'id' })
};
