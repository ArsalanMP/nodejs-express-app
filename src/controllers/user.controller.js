const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const getUser = catchAsync(async (req, res) => {
  const { user } = req;
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user.id, req.body);
  res.send(user);
});

const followModel = catchAsync(async (req, res) => {
  const user = await userService.followModelById(req.user.id, req.params.userId);
  res.send(user);
});

const unfollowModel = catchAsync(async (req, res) => {
  const user = await userService.unfollowModelById(req.user.id, req.params.userId);
  res.send(user);
});

const modelsWithMostPosts = catchAsync(async (req, res) => {
  const result = await userService.modelsWithMostPosts();
  res.send(result);
});

const getModelInfo = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Model not found');
  }
  if (user.role !== 'model') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Model not found');
  }
  res.send(user);
});

module.exports = {
  getUser,
  updateUser,
  followModel,
  unfollowModel,
  modelsWithMostPosts,
  getModelInfo,
};
