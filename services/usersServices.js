const { UsersModel } = require("../models");
const { passwordsUtils } = require("../utils");

module.exports = class UsersServices {
  constructor() {}

  static async getUserByEmail(email) {
    email = email?.toLowerCase();
    const user = await UsersModel.findOne({ email });
    return user;
  }

  static async getUserById({ id }) {
    const user = await UsersModel.findById({ _id: id });
    return user;
  }

  static async getAllUser() {
    const user = await UsersModel.find();
    return user;
  }

  static async getUserByAdmin() {
    const user = await UsersModel.find({ role: "admin" });
    return user;
  }

  static async createUser(data) {
    console.log("dataaa ------------>", data);
    try {
      const user = new UsersModel(data);

      await user.save();

      return {
        success: true,
        user,
      };
    } catch (err) {
      return {
        success: false,
        err,
      };
    }
  }

  static async updateUser({ data, id }) {
    try {
      let user = await UsersModel.findByIdAndUpdate(id, data, { new: true });
      return {
        success: true,
        user,
      };
    } catch (err) {
      return {
        success: false,
        err,
      };
    }
  }

  static async deleteUser({ id }) {
    try {
      await UsersModel.deleteOne(id);
      return {
        success: true,
      };
    } catch (err) {
      return {
        success: false,
        err,
      };
    }
  }

  static async verifyUserPassword(data) {
    try {
      const { dbPassword, inputPassword } = data;

      const isCorrectPassword = await passwordsUtils.verify(
        inputPassword,
        dbPassword
      );
      return {
        success: isCorrectPassword,
      };
    } catch (err) {
      return {
        success: false,
        err,
      };
    }
  }
};
