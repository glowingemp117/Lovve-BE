const User = require("../schemas/User");

const aggregateUserData = async (user) => {
  const aggregatedUserData = await User.aggregate([
    {
      $match: { _id: user._id },
    },
    {
      $lookup: {
        from: "attachments",
        localField: "_id",
        foreignField: "user_id",
        as: "attachments",
      },
    },
    {
      $lookup: {
        from: "countries",
        localField: "country",
        foreignField: "_id",
        as: "country",
      },
    },
    {
      $unwind: {
        path: "$country",
      },
    },
    {
      $lookup: {
        from: "profilestatuses",
        localField: "_id",
        foreignField: "user_id",
        as: "profile_stats",
      },
    },
    {
      $unwind: {
        path: "$profile_stats",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "user_id",
        as: "likes",
      },
    },
    {
      $unwind: {
        path: "$likes",
      },
    },
  ]);

  return aggregatedUserData;
};
module.exports = { aggregateUserData };
