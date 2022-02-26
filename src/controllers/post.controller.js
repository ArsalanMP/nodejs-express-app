const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { postService, userService } = require('../services');

const createPost = catchAsync(async (req, res) => {
  const post = await postService.createPost({ ...req.body, user: req.user });
  res.status(httpStatus.CREATED).send(post);
});

const getPosts = catchAsync(async (req, res) => {
  const filter = pick(req, ['user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await postService.queryPosts(filter, options);
  res.send(result);
});

const getPostsFeed = catchAsync(async (req, res) => {
  const filter = pick(req, ['user']);
  const options = { ...pick(req.query, ['sortBy', 'limit', 'page']), populate: 'user' };
  const result = await postService.queryPostsFeed(filter, options);
  res.send(result);
});

const getPost = catchAsync(async (req, res) => {
  const post = await postService.getPostById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.send(post);
});

const updatePost = catchAsync(async (req, res) => {
  const post = await postService.updatePostById(req.params.postId, { ...req.body, user: req.user });
  res.send(post);
});

const deletePost = catchAsync(async (req, res) => {
  await postService.deletePostById(req.params.postId, req.user);
  res.status(httpStatus.NO_CONTENT).send();
});

const searchPostsByOwner = catchAsync(async (req, res) => {
  const { keyword } = req.query;
  const projectionString = '_id';
  const models = await userService.searchModelsWithoutPagination(
    {
      $or: [
        { firstName: new RegExp(keyword, 'i') },
        { lastName: new RegExp(keyword, 'i') },
        { username: new RegExp(keyword, 'i') },
      ],
    },
    projectionString
  );

  const filter = {
    user: { $in: models },
  };
  const options = { ...pick(req.query, ['sortBy', 'limit', 'page']), populate: 'user' };
  const result = await postService.searchPostsByOwner(filter, options);
  res.send(result);
});

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  getPostsFeed,
  searchPostsByOwner,
};
