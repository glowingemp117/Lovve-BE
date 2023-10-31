const config = require("config");

const AppResponse = require("./AppResponse");

module.exports = class UsersResponsesFactory {
  constructor() {}

  static userRegisteredSuccessfully({ user, token, res } = {}) {
    const headers = {
      [config.get("tokenVariable")]: token,
    };
    return new AppResponse({
      message: "User registered successfully",
      statusCode: 201,
      body: user,
      headers,
    });
  }

  static userUpdatedSuccessfully({ user } = {}) {
    return new AppResponse({
      message: "User updated successfully",
      statusCode: 200,
      body: user,
    });
  }

  static userDeletedSuccessfully({ user } = {}) {
    return new AppResponse({
      message: "User deleted successfully",
      statusCode: 200,
      body: user,
    });
  }

  static userLoggedInSuccessfully({ user } = {}) {
    return new AppResponse({
      message: "User logged in successfully",
      statusCode: 200,
      body: user,
    });
  }

  static singleUserInfoRetrievedRes({ user, res } = {}) {
    return new AppResponse({
      message: "User info retrieved successfully",
      statusCode: 200,
      body: user,
    });
  }

  static usersInfoRetrievedRes({ users } = {}) {
    return new AppResponse({
      message: "Users info retrieved successfully",
      statusCode: 200,
      body: users,
    });
  }
};
