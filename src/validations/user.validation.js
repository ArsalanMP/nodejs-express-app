const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const getUser = {};

const updateUser = {
  body: Joi.object()
    .keys({
      username: Joi.string(),
      password: Joi.string().custom(password),
      firstName: Joi.string(),
      lastName: Joi.string(),
      profileImage: Joi.string(),
      role: Joi.string().valid('user', 'model'),
    })
    .min(1),
};

module.exports = {
  getUser,
  updateUser,
};
