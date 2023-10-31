const { usersRoute } = require(`../routes`);

module.exports.prepareV1Routes = (app) => {
  const prefix = "/api/v1/";

  app.use(`${prefix}users`, usersRoute); // This route is public mostly and whenever it's not, it's protected by the authMiddleware inside the specific route
};
