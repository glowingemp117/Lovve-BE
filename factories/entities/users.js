const omit = require("lodash/omit");
const { array } = require("yup");

module.exports = class UsersEntityFactory {
  constructor() {}

  static cleanUserObj({ user, extraFieldsToOmit = [] }) {
    const fieldsToOmit = [
      "_id",
      "__v",
      "password",
      "createdAt",
      "updatedAt",
      ...extraFieldsToOmit,
    ];

    return omit({
      id: user._id,
      ...omit(user.toJSON(), fieldsToOmit),
    });
  }

  static cleanUserArr({ users, extraFieldsToOmit = [] }) {
    const fieldsToOmit = [
      "_id",
      "__v",
      "password",
      "createdAt",
      "updatedAt",
      ...extraFieldsToOmit,
    ];
    let allUsers = [];
    for (let i = 0; i < users?.length; i++) {
      allUsers.push(
        omit({
          id: users[i]._id,
          ...omit(users[i].toJSON(), fieldsToOmit),
        })
      );
    }
    return allUsers;
  }
};
