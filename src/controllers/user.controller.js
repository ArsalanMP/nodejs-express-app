const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const pick = require('../utils/pick');

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
  const options = pick(req.query, ['limit', 'page']);
  const result = await userService.modelsWithMostPosts(options);
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

const searchModels = catchAsync(async (req, res) => {
  const { keyword } = req.query;
  const filter = {
    $or: [
      { firstName: new RegExp(keyword, 'i') },
      { lastName: new RegExp(keyword, 'i') },
      { username: new RegExp(keyword, 'i') },
    ],
  };
  const projectionString = 'username';
  const options = { ...pick(req.query, ['sortBy', 'limit', 'page']), projectionString };
  const result = await userService.searchModels(filter, options);
  res.send(result);
});

const searchModelsv2 = catchAsync(async (req, res) => {
  const { keyword } = req.query;
  const allModels = await userService.getAllModels();
  const filteredModels = allModels
    .filter(
      (model) =>
        model.firstName.toLowerCase().indexOf(keyword) > -1 ||
        model.lastName.toLowerCase().indexOf(keyword) > -1 ||
        model.username.toLowerCase().indexOf(keyword) > -1
    )
    .map((item) => {
      return { username: item.username, id: item.id };
    });
  res.send(filteredModels);
});

module.exports = {
  getUser,
  updateUser,
  followModel,
  unfollowModel,
  modelsWithMostPosts,
  getModelInfo,
  searchModels,
  searchModelsv2,
};
