const _ = require('lodash');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');

const sequelize = require('../../../database/sequelize');
const models = require('../../models');
const CalorieService = require('../../services/calorie');

const UserCtrl = {
    async signUp(user) {
        return sequelize.transaction(async (t) => {
            const createUser = await models.UserModel.create(user, { returning: true, transaction: t });
            const userJson = createUser.toJSON();
            delete userJson.password;
            const token = jwt.sign({ userId: userJson.id }, process.env.JWT_SICRET);
            await models.WeightHistoryModel.create({
                userId: userJson.id,
                weight: userJson.weight
            }, { transaction: t });

            return { user: userJson, token };
        });
    },

    async getUser(userId) {
        const user = await models.UserModel.findById(userId);
        const userJSON = user.toJSON();
        delete userJSON.password;

        return userJSON;
    },

    async signIn(user) {
        const { email, password } = user;
        const findUser = await models.UserModel.findOne({ where: { email } });
        const userJson = findUser ? findUser.toJSON() : {};

        if (!passwordHash.verify(password, userJson.password)) {
            throw { message: 'Email or password incorrect.' };
        }
        delete userJson.password;
        const token = jwt.sign({ userId: userJson.id }, process.env.JWT_SICRET);

        return { user: userJson, token };
    },

    async updateDiet(userId, dietId) {
        await models.UserModel.update({ dietId }, { where: { id: userId }, hooks: false });
        const user = await models.UserModel.findById(userId);
        const userJSON = user.toJSON();
        delete userJSON.password;

        return userJSON;
    },

    async updateWeight(userId, weight) {
        await sequelize.transaction(async (t) => {
            await models.UserModel.update({ weight }, { where: { id: userId }, transaction: t, hooks: false });
            await models.WeightHistoryModel.create({ userId, weight }, { transaction: t });
        });

        const user = (await models.UserModel.findById(userId)).toJSON();
        delete user.password;

        return user;
    },

    resetPassword(content) {
        const password = passwordHash.generate(content.password);

        return models.UserModel.update({ password }, { where: { email: content.email }, hooks: false })
    },

    getCalorie(userId) {
        return CalorieService.getCalorie(userId);
    }
};

module.exports = UserCtrl;
