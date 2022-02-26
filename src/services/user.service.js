const httpStatus = require('http-status');
const { User, Post } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isUsernameTaken(userBody.username)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }
  return User.create(userBody);
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by username
 * @param {string} username
 * @returns {Promise<User>}
 */
const getUserByUsername = async (username) => {
  return User.findOne({ username });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.username && (await User.isUsernameTaken(updateBody.username, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Follow a model by id
 * @param {ObjectId} userId
 * @param {ObjectId} modelID
 * @returns {Promise<User>}
 */
const followModelById = async (userId, modelId) => {
  const user = await getUserById(userId);
  const model = await getUserById(modelId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!model) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Model not found');
  }
  if (model.role === 'user' || user.role === 'model') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  if (!user.following.includes(model.id)) {
    Object.assign(user, { following: [...user.following, model.id] });
    await user.save();
  }

  return user;
};

/**
 * Unfollow a model by id
 * @param {ObjectId} userId
 * @param {ObjectId} modelID
 * @returns {Promise<User>}
 */
const unfollowModelById = async (userId, modelId) => {
  const user = await getUserById(userId);
  const model = await getUserById(modelId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!model) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Model not found');
  }
  if (model.role === 'user' || user.role === 'model') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  if (user.following.includes(model.id)) {
    Object.assign(user, { following: user.following.filter((item) => String(item) !== String(model.id)) });
    await user.save();
  }

  return user;
};

/**
 * Query for models with most post
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const modelsWithMostPosts = async (options) => {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const skip = (page - 1) * limit;

  const docsPromise = Post.aggregate()
    .group({
      _id: '$user',
      postCount: { $sum: 1 },
    })
    .sort({
      postCount: -1,
    })
    .skip(skip)
    .limit(limit)
    .exec();

  const countPromise = User.countDocuments({ role: 'model' }).exec();
  return Promise.all([countPromise, docsPromise]).then((values) => {
    const [totalResults, results] = values;
    const totalPages = Math.ceil(totalResults / limit);
    const result = {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
    return Promise.resolve(result);
  });
};

/**
 * Get Model by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getModelInfo = async (id) => {
  return User.findById(id);
};

/**
 * Get all Models
 * @returns {Promise<QueryResult>}
 */
const getAllModels = async () => {
  return User.find().where({ role: 'model' });
};

/**
 * Search for models by name
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} [options.projectionString] - Selected feilds of results (default = undefined)
 * @returns {Promise<QueryResult>}
 */
const searchModels = async (filter, options) => {
  const models = await User.paginate(filter, options);
  return models;
};

/**
 * Search for models by name
 * @param {Object} filter - Mongo filter
 * @param {string} [projectionString] - Selected feilds of results (default = undefined)
 * @returns {Promise<QueryResult>}
 */
const searchModelsWithoutPagination = async (filter, projectionString) => {
  const models = await User.find(filter, projectionString);
  return models;
};

module.exports = {
  createUser,
  getUserById,
  updateUserById,
  getUserByUsername,
  followModelById,
  unfollowModelById,
  modelsWithMostPosts,
  getModelInfo,
  searchModels,
  searchModelsWithoutPagination,
  getAllModels,
};
