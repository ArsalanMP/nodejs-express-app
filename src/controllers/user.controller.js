const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');


const getUser = catchAsync(async (req, res) => {
  const user = req.user;
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

module.exports = {
  getUser,
  updateUser,
  followModel,
  unfollowModel
};
