module.exports = (models) => {
    models.ProductModel.hasMany(models.ProductScheduleModel, { foreignKey: 'productId', targetKey: 'productId' })
};
