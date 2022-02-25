const allRoles = {
  user: ['subscribeToModels'],
  model: ['managePosts'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
