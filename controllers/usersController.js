const {
  UsersServices,
  BusinessUsersServices,
  BusinessServices,
  CountryServices,
  RoleServices,
} = require("../services");
const {
  UsersErrorsFactory,
  GeneralErrorsFactory,
  UsersResponsesFactory,
  UsersEntityFactory,
  BusinessErrorsFactory,
  CountryErrorsFactory,
} = require("../factories");
const { passwordsUtils } = require("../utils");
const { usersConstants } = require("../constants");

module.exports = class UsersController {
  constructor() {}

  static async createUser(req, res, next) {
    let role = req.body.role;
    if (role === "superAdmin")
      return next(UsersErrorsFactory.userNotSuperAdminErr());

    let isUserFound = await UsersServices.getUserByEmail(req.body.email);
    if (isUserFound) return next(UsersErrorsFactory.userAlreadyRegisteredErr());

    let business = await BusinessServices.getBusinessById({
      id: req.body.businessId,
    });
    if (!business) return next(BusinessErrorsFactory.businessNotFoundErr());

    let countryFound = await CountryServices.getCountryById({
      id: req.body.countryId,
    });
    if (!countryFound) return next(CountryErrorsFactory.countryNotFoundErr());

    let businessByUser = await BusinessServices.getBusinessByUserId({
      id: req.body.userId,
    });
    if (!businessByUser)
      return next(BusinessErrorsFactory.businessNotFoundErr());

    let businessRoleMatch = await RoleServices.getRoleById({
      id: req.body.roleId,
    });
    if (!businessRoleMatch)
      return next(BusinessErrorsFactory.businessRoleFoundErr());

    const data = {
      email: req.body.email?.toLowerCase(),
      password: await passwordsUtils.saltHashPassword(req.body.password),
      name: req.body.name,
      countryId: req.body.countryId,
      role: req.body.role,
      isActive: req.body.isActive,
    };

    const businessUsersData = {
      userId: req.body.userId,
      businessId: req.body.businessId,
      roleId: req.body.roleId,
    };

    try {
      const { success, err, user } = await UsersServices.createUser(data);
      if (success) {
        if (req.body.businessId) {
          const { success, err, businessUser } =
            await BusinessUsersServices.createBusinessUser(businessUsersData);
          if (success) {
            return next(
              UsersResponsesFactory.userRegisteredSuccessfully({
                user: UsersEntityFactory.cleanUserObj({
                  user,
                }),
                // token: await user.generateAuthToken(),
              })
            );
          } else throw err;
        }
      } else throw err;
    } catch (err) {
      return next(GeneralErrorsFactory.internalErr({ err }));
    }
  }

  static async loginUser(req, res, next) {
    try {
      const inputData = req.body;

      const userToLogin = await UsersServices.getUserByEmail(inputData.email);

      if (!userToLogin)
        return next(UsersErrorsFactory.wrongEmailOrPasswordErr());

      if (!userToLogin.isActive)
        return next(UsersErrorsFactory.inActiveUserNoLoggedInErr());

      const { success, err } = await UsersServices.verifyUserPassword({
        inputPassword: inputData.password,
        dbPassword: userToLogin.password,
      });
      if (err) throw err;

      if (success)
        return next(
          UsersResponsesFactory.userLoggedInSuccessfully({
            user: UsersEntityFactory.cleanUserObj({
              user: userToLogin,
            }),
          })
        );
      else return next(UsersErrorsFactory.wrongEmailOrPasswordErr());
    } catch (err) {
      return next(GeneralErrorsFactory.internalErr({ err }));
    }
  }

  static async getUser(req, res, next) {
    try {
      let user = await UsersServices.getUserById({ id: req.params.id });
      if (!user) return next(UsersErrorsFactory.userNotFoundErr());

      return next(
        UsersResponsesFactory.singleUserInfoRetrievedRes({
          user: UsersEntityFactory.cleanUserObj({ user }),
        })
      );
    } catch (err) {
      return next(GeneralErrorsFactory.internalErr({ err }));
    }
  }

  static async getUsers(req, res, next) {
    try {
      let users = await UsersServices.getAllUser();

      return next(
        UsersResponsesFactory.usersInfoRetrievedRes({
          users: UsersEntityFactory.cleanUserArr({ users }),
        })
      );
    } catch (err) {
      return next(GeneralErrorsFactory.internalErr({ err }));
    }
  }

  static async getLoggedInUserInformation(req, res, next) {
    try {
      let user = await UsersServices.getUserById({ id: req.user.id });
      if (!user) return next(UsersErrorsFactory.userNotFoundErr());

      return next(
        UsersResponsesFactory.singleUserInfoRetrievedRes({
          user: UsersEntityFactory.cleanUserObj({ user }),
        })
      );
    } catch (err) {
      return next(GeneralErrorsFactory.internalErr({ err }));
    }
  }

  static async updateUser(req, res, next) {
    const data = {
      name: req.body.name,
      countryId: req.body.countryId,
      role: req.body.role,
      isActive: req.body.isActive,
    };
    try {
      let isUserFound = await UsersServices.getUserById({
        id: req.params.id,
      });
      if (!isUserFound) return next(UsersErrorsFactory.userNotFoundErr());

      const { success, err, user } = await UsersServices.updateUser({
        data: data,
        id: req.params.id,
      });

      if (success)
        return next(
          UsersResponsesFactory.userUpdatedSuccessfully({
            user: UsersEntityFactory.cleanUserObj({
              obj: user,
            }),
          })
        );
      else throw err;
    } catch (err) {
      return next(GeneralErrorsFactory.internalErr({ err }));
    }
  }

  static async deleteUser(req, res, next) {
    try {
      let isUserFound = await UsersServices.getUserById({
        id: req.params.id,
      });
      if (!isUserFound) return next(UsersErrorsFactory.userNotFoundErr());

      const { success, err } = await UsersServices.deleteUser({
        id: req.params.id,
      });

      if (success)
        return next(
          UsersResponsesFactory.userDeletedSuccessfully({
            user: UsersEntityFactory.cleanUserObj({
              obj: user,
            }),
          })
        );
      else throw err;
    } catch (err) {
      return next(GeneralErrorsFactory.internalErr({ err }));
    }
  }
};
