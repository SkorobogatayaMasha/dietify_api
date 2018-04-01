const _ = require('lodash');
const emailValidator = require('email-validator');
const passwordHash = require('password-hash');
const moment = require('moment');

module.exports = (models) => async (user) => {
  const payload = _.pick(user, ['name', 'email', 'password', 'gender', 'weight', 'dateOfBirth', 'growth']);
  const { password, email } = payload;
  if (!isPasswordValid(password)) {
    throw {
      message: `Invalid password provided. Password should be at least 6 characters long and should include numbers.`,
    };
  }

  if (!emailValidator.validate(email)) {
    throw {
      message: 'Invalid email provided.',
    };
  }

  const foundUser = await models.UserModel.findOne({
    where: {
      email: email.toLowerCase().trim(),
    },
    raw: true,
  });
  console.log(foundUser);
  if (foundUser) {
    throw { message: 'Email already exists' };
  }

  payload.password = await passwordHash.generate(payload.password);
  payload.email = payload.email.toLowerCase().trim();
  payload.dateOfBirth = moment(payload.dateOfBirth);

  Object.assign(user, payload);
};

function isPasswordValid(password) {
  return password && password.length && (password.length > 6);
}
