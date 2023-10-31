const r = {
  superAdmin: "superAdmin",
  admin: "admin",
  user: "user",
};
module.exports.aclConstants = {
  users: {
    getAll: [r.superAdmin, r.admin],
    getSpecificUser: [...Object.keys(r)],
    createUser: [...Object.keys(r)],
    updateUser: [...Object.keys(r)],
    deleteUser: [...Object.keys(r)],
  },
};
