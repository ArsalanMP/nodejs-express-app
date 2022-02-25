const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

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

const followModel = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getModelInfo = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const searchModels = {
  query: Joi.object().keys({
    keyword: Joi.string().required(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  updateUser,
  followModel,
  getModelInfo,
  searchModels,
};
