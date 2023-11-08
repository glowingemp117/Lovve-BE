const asyncHandler = require("express-async-handler");
const RelationDetail = require("../schemas/relation_detail");
const {
  successResponse,
  SuccessWithoutBody,
  PrintError,
  verifyrequiredparams,
  sendNotification,
} = require("../middleware/common");

const addLike = async (req, res) => {
  try {
    const likedTo = req.body.likedTo; // User ID of the liked user
    const likedBy = req.user;
    const relationDetail = await RelationDetail.findOne({ likedBy, likedTo });

    if (!relationDetail) {
      return { status: 404, message: "User  not found" };
    }

    if (relationDetail.liked) {
      return { status: 200, message: "You've already liked this user" };
    }

    // Mark the relation as liked and visited
    relationDetail.liked = true;
    relationDetail.visited = true;

    // Save the updated relation detail
    await relationDetail.save();

    return { status: 200, message: "Like added successfully" };
  } catch (error) {
    console.error(error);
    return { status: 500, message: "Server error" };
  }
};

module.exports = {
  addLike,
};
