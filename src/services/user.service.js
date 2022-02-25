const httpStatus = require('http-status');
const { User } = require('../models');
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

  if(!user.following.includes(model.id)) {
    Object.assign(user, {following: [...user.following, model.id]});
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

  console.log(user.following, model.id,user.following.includes(model.id));
  if(user.following.includes(model.id)) {
    Object.assign(user, { following: user.following.filter((item)=>item != model.id) });
    await user.save();
  }
  
  return user;
};

module.exports = {
  createUser,
  getUserById,
  updateUserById,
  getUserByUsername,
  followModelById,
  unfollowModelById
};
