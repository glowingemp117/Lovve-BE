const omit = require("lodash/omit");
const { array } = require("yup");

module.exports = class GeneralEntityFactory {
  constructor() {}

  static cleanMongooseObject({ obj, extraFieldsToOmit = [] }) {
    const fieldsToOmit = ["_id", "__v", "createdAt","updatedAt", ...extraFieldsToOmit];

    return omit({
      id: obj?._id,
      ...omit(obj?.toJSON(), fieldsToOmit),
    });
  }

  static cleanMongooseArray({ array, extraFieldsToOmit = [] }) {
    const fieldsToOmit = ["_id", "__v", "createdAt", "updatedAt", ...extraFieldsToOmit];
    let arrayOfObjects = [];
    for (let i = 0; i < array?.length; i++) {
      arrayOfObjects.push(
        omit({
          id: array[i]._id,
          ...omit(array[i].toJSON(), fieldsToOmit),
        })
      );
    }
    return arrayOfObjects;
  }
};
