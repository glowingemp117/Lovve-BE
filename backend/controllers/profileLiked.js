const asyncHandler = require("express-async-handler");
const RelationDetail = require("../schemas/relation_detail");
const Country = require("../schemas/country");

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
    const likedTo = req.body.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count the number of likes by the user on the current day
    const likesToday = await RelationDetail.countDocuments({
      likedBy: _id,
      liked: true,
      visited: true,
      createdAt: { $gte: today },
    });

    if (likesToday >= 3) {
      return res.status(400).json({
        message: "Today free likes limit reached, subscribe to get more likes.",
      });
    }

    const relationDetail = await RelationDetail.findOne({
      likedBy: _id,
      likedTo: likedTo,
    });

    if (!relationDetail) {
      const relation = await RelationDetail.create({
        likedBy: _id,
        likedTo: likedTo,
        liked: true,
        visited: true,
      });
      if (relation?.liked) {
        const relationMatch = await RelationDetail.findOne({
          likedBy: likedTo,
          likedTo: _id,
          liked: true,
          visited: true,
        });
        if (relationMatch) {
          const relationMatched = await RelationDetail.findOne({
            likedBy: _id,
            likedTo: likedTo,
            liked: true,
            visited: true,
          });
          await RelationDetail.updateOne(
            { _id: relationMatch._id },
            { $set: { matched: true } }
          );
          await RelationDetail.updateOne(
            { _id: relationMatched._id },
            { $set: { matched: true } }
          );
        }
      }
      return res.status(200).json({ message: "Like added successfully" });
    } else {
      const relation = await RelationDetail.findOneAndUpdate(
        { _id: relationDetail._id },
        { $set: { liked: true, visited: true } },
        { new: true }
      );
      if (relation?.liked) {
        const relationMatch = await RelationDetail.findOne({
          likedBy: likedTo,
          likedTo: _id,
          liked: true,
          visited: true,
        });
        if (relationMatch) {
          const relationMatched = await RelationDetail.findOne({
            likedBy: _id,
            likedTo: likedTo,
            liked: true,
            visited: true,
          });
          await RelationDetail.updateOne(
            { _id: relationMatch._id },
            { $set: { matched: true } }
          );
          await RelationDetail.updateOne(
            { _id: relationMatched._id },
            { $set: { matched: true } }
          );
        }
      }
      return res.status(200).json({ message: "Like added successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const addVisted = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const likedTo = req.body.id;

    const relationDetail = await RelationDetail.findOne({
      likedBy: _id,
      likedTo: likedTo,
    });

    if (!relationDetail) {
      await RelationDetail.create({
        likedBy: _id,
        likedTo: likedTo,
        visited: true,
      });

      return res.status(200).json({status: 201, message: "Visted added successfully" });
    } else {
      await RelationDetail.findOneAndUpdate(
        { _id: relationDetail._id },
        { $set: { visited: true } },
        { new: true }
      );

      return res.status(200).json({ status: 201,message: "Visited added successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const getLike = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you can access the authenticated user's ID
    const page = parseInt(req.query.page) || 1; // Get the page number from the query (default to 1)
    const perPage = parseInt(req.query.per_page) || 10; // Get the number of items per page from the query (default to 10)

    const skip = (page - 1) * perPage;

    // Query the database to find matched users with pagination
    const matchedUsersQuery = RelationDetail.find({ likedBy: userId })
      .or([{ liked: true }, { liked: false }])
      .populate({
        path: "likedTo",
        select: "name age gender country selfie_id",
        populate: {
          path: "country",
          select: "id name flag",
        },
      })
      .select("matched liked visited")
      .skip(skip)
      .limit(perPage);

    const matchedUsers = await matchedUsersQuery.exec();

    const responseData = matchedUsers.map((user) => ({
      user: {
        id: user.likedTo._id,
        name: user.likedTo.name,
        age: user.likedTo.age,
        country: user.likedTo.country,
        gender: user.likedTo.gender,
        selfie_id: user.likedTo.selfie_id,
      },
      relation_details: {
        matched: user.matched,
        liked: user.liked,
        visited: user.visited,
      },
    }));

    const totalMatchedUsers = await RelationDetail.countDocuments({
      likedBy: userId,
      matched: true,
    });

    const totalPages = Math.ceil(totalMatchedUsers / perPage);

    res.status(200).json({
      status: 200,
      message: "Fetched successfully",
      data: responseData,
      meta: {
        current_page: page,
        last_page: totalPages,
        per_page: perPage,
        total: totalMatchedUsers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const getVisitor = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you can access the authenticated user's ID
    const page = parseInt(req.query.page) || 1; // Get the page number from the query (default to 1)
    const perPage = parseInt(req.query.per_page) || 10; // Get the number of items per page from the query (default to 10)

    const skip = (page - 1) * perPage;

    // Query the database to find matched users with pagination
    const matchedUsersQuery = RelationDetail.find({ likedBy: userId })
      .or([{ visited: true }, { visited: false }])
      .populate({
        path: "likedTo",
        select: "name age gender country selfie_id",
        populate: {
          path: "country",
          select: "id name flag",
        },
      })
      .select("matched liked visited")
      .skip(skip)
      .limit(perPage);

    const matchedUsers = await matchedUsersQuery.exec();

    const responseData = matchedUsers.map((user) => ({
      user: {
        id: user.likedTo._id,
        name: user.likedTo.name,
        age: user.likedTo.age,
        country: user.likedTo.country,
        gender: user.likedTo.gender,
        selfie_id: user.likedTo.selfie_id,
      },
      relation_details: {
        matched: user.matched,
        liked: user.liked,
        visited: user.visited,
      },
    }));

    const totalMatchedUsers = await RelationDetail.countDocuments({
      likedBy: userId,
      matched: true,
    });

    const totalPages = Math.ceil(totalMatchedUsers / perPage);

    res.status(200).json({
      status: 200,
      message: "Fetched successfully",
      data: responseData,
      meta: {
        current_page: page,
        last_page: totalPages,
        per_page: perPage,
        total: totalMatchedUsers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const getMatches = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you can access the authenticated user's ID
    const page = parseInt(req.query.page) || 1; // Get the page number from the query (default to 1)
    const perPage = parseInt(req.query.per_page) || 10; // Get the number of items per page from the query (default to 10)

    const skip = (page - 1) * perPage;

    // Query the database to find matched users with pagination
    const matchedUsersQuery = RelationDetail.find({ likedBy: userId })
      .or([{ matched: true }, { matched: false }])
      .populate({
        path: "likedTo",
        select: "name age gender country selfie_id",
        populate: {
          path: "country",
          select: "id name flag",
        },
      })
      .select("matched liked visited")
      .skip(skip)
      .limit(perPage);

    const matchedUsers = await matchedUsersQuery.exec();

    const responseData = matchedUsers.map((user) => ({
      user: {
        id: user.likedTo._id,
        name: user.likedTo.name,
        age: user.likedTo.age,
        country: user.likedTo.country,
        gender: user.likedTo.gender,
        selfie_id: user.likedTo.selfie_id,
      },
      relation_details: {
        matched: user.matched,
        liked: user.liked,
        visited: user.visited,
      },
    }));

    const totalMatchedUsers = await RelationDetail.countDocuments({
      likedBy: userId,
      matched: true,
    });

    const totalPages = Math.ceil(totalMatchedUsers / perPage);

    res.status(200).json({
      status: 200,
      message: "Fetched successfully",
      data: responseData,
      meta: {
        current_page: page,
        last_page: totalPages,
        per_page: perPage,
        total: totalMatchedUsers,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const getMatched = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you can access the authenticated user's ID

    // Query the database to find matched users
    const matchedUsers = await RelationDetail.find({
      likedBy: userId,
      matched: true,
    })
      .populate({
        path: "likedTo",
        select: "name age gender selfie country selfie_id",
        populate: {
          path: "country",
          select: "id name flag",
        },
      })
      .populate({
        path: "likedBy",
        select: "name age gender selfie_id country",
        populate: {
          path: "country",
          select: "id name flag",
        },
      })
      .exec();

    const responseData = matchedUsers.map((user) => ({
      my_profile: {
        id: user.likedBy._id,
        name: user.likedBy.name,
        age: user.likedBy.age,
        country: user.likedBy.country,
        gender: user.likedBy.gender,
        selfie_id: user.likedBy.selfie_id,
      },
      potential_match: {
        id: user.likedTo._id,
        name: user.likedTo.name,
        age: user.likedTo.age,
        country: user.likedTo.country,
        gender: user.likedTo.gender,
        selfie_id: user.likedTo.selfie_id,
      },
    }));

    res.status(200).json({
      status: 200,
      message: "Fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const createMatch = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;
    const likedTo = req.body.id;

    const matchBy = await RelationDetail.findOne({
      likedBy: _id,
      likedTo: likedTo,
      liked: true,
      visited: true,
    });

    const matchTo = await RelationDetail.findOne({
      likedBy: likedTo,
      likedTo: _id,
      liked: true,
      visited: true,
    });

    if (!matchBy || !matchTo) {
      return res.status(400).json({ message: "User not found" });
    }

    // Update the documents only if they exist
    await RelationDetail.updateOne(
      { _id: matchBy._id },
      { $set: { matched: true } }
    );

    await RelationDetail.updateOne(
      { _id: matchTo._id },
      { $set: { matched: true } }
    );

    return res.status(201).json({ message: "Match created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = {
  addLike,
  getLike,
  getVisitor,
  getMatches,
  getMatched,
  addVisted,
  createMatch
};
