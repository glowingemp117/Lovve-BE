const asyncHandler = require("express-async-handler");
const RelationDetail = require("../schemas/relation_detail");
const {
  successResponse,
  SuccessWithoutBody,
  PrintError,
  verifyrequiredparams,
  sendNotification,
} = require("../middleware/common");

const addLike = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const likedTo = req.body.id; // User ID of the liked user
    const relationDetail = await RelationDetail.findOne({
      likedBy: _id,
      likedTo: likedTo,
    });

    if (relationDetail.liked) {
      const relationMatch = await RelationDetail.findOne({
        likedBy: likedTo,
        likedTo: _id,
        liked: true,
        visited: true,
      });
      if (relationMatch) {
        await RelationDetail.updateOne(
          { _id: relationMatch._id },
          { $set: { mached: true } }
        );
      }
      return { status: 200, message: "You've already liked this user" };
    }

    if (!relationDetail) {
      await new RelationDetail.create({
        likedBy: _id,
        likedTo: likedTo,
        liked: true,
        visited: true,
      });
    }

    return { status: 200, message: "Like added successfully" };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Server error" };
  }
});

module.exports = {
  addLike,
};
