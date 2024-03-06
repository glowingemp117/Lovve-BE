const asyncHandler = require("express-async-handler");
const {
  successResponse,
  SuccessWithoutBody,
  PrintError,
  verifyrequiredparams,
  sendNotification,
  successResponseWithToken,
  successResponseVerifyOtp,
  successResponseSignup,
} = require("../middleware/common");
const User = require("../schemas/User");
const attachment = require("../schemas/attachments");
const country_id = require("../schemas/country");
const FAQ = require("../schemas/FAQ");
const like = require("../schemas/likes");
const profilestatus = require("../schemas/profile_stats");
const Settings = require("../schemas/AdminSettings");
const PreSignup = require("../schemas/PreSignup");
const Devices = require("../schemas/Devices");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getProfile } = require("../helpers/UserHelper");
const { sendEmail } = require("../middleware/sendEmail");
const { getCode } = require("../helpers/UserHelper");
const { verifyGenerateCode } = require("../helpers/UserHelper");
const mongoose = require("mongoose");

//Love project auth
const registerUser = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      email,
      age,
      country,
      gender,
      selfie_id,
      attachments,
      device_type,
      timezone,
      user_type,
      device_id,
      bio,
    } = req.body;
    await verifyrequiredparams(
      400,
      req.body,
      [
        "name",
        "email",
        "age",
        "gender",
        "country",
        "selfie_id",
        "attachments",
        "device_type",
        "timezone",
        "user_type",
        "device_id",
      ],
      res
    );
    let emaile = email.toLowerCase();
    const userExists = await User.findOne({ email: emaile });

    // if (userExists) {
    //   throw new Error("User already exists");
    // }
    // const otp = await verifyGenerateCode();

    let errorOccurred = false;
    // create user
    // const user = await User.create({
    //   name,
    //   email: emaile,
    //   age,
    //   country: country,
    //   gender,
    //   selfie_id,
    //   attachments: attachments,
    //   device_type,
    //   user_type,
    //   timezone,
    //   otp,
    //   device_id,
    // });

    const user = await User.updateOne(
      { _id: userExists._id },
      {
        $set: {
          name: name,
          // email: emaile,
          age: age,
          country: country,
          gender: gender,
          selfie_id: selfie_id,
          attachments: attachments,
          device_type: device_type,
          user_type: user_type,
          timezone: timezone,
          device_id: device_id,
          bio: bio,
          new_user: false,
        },
      }
    );

    // if (user)
    if (!userExists) {
      errorOccurred = true;
    } else {
      await Devices.create({
        user_id: userExists._id,
        device_id: device_id,
        device_type: device_type,
      });
      await profilestatus.create({
        user_id: userExists._id,
        total_likes: 0,
        total_maches: 0,
      });
      await like.create({
        user_id: userExists._id,
        total: 0,
        remaining: 0,
        limited: true,
      });
      if (errorOccurred) {
        throw new Error("Something Went Wrong while creating user");
      }
      let profile = {};
      // check if user being created is worker or user_type == 2
      if (userExists.user_type == 2) {
        profile = await getProfile(userExists._id);
      }

      //check if user created is employer or user_type == 1
      if (userExists.user_type == 1) {
        profile = await getProfile(userExists._id);
      }
      // const html = "<h1>hello world</h1>"
      // await sendEmail('passim_cynic@yahoo.com', "TEST 123", html)
      const accesstoken = generateToken(userExists._id, profile.name, emaile);
      // const notification_obj = {
      //     title: "title",
      //     message: `message`,
      //     body: `message`,
      //     type: "signup",
      //     status: "0",
      //     color: "#fff",
      //     object: {
      //     }
      // };
      // await sendNotification(user._id, notification_obj);
      // successResponse(
      //   201,
      //   "Account created successfully",
      //   {
      //     ...profile,
      //     accesstoken,
      //   },
      //   res
      // );
      const { new_user, ...profileWithoutNewUser } = profile;

      return successResponseSignup(
        201,
        "Logged in successfully",
        profileWithoutNewUser,
        accesstoken,
        res
      );
    }
    // else {
    // //   throw new Error("Something Went Wrong while creating user");
    // // }
  } catch (error) {
    return PrintError(400, error.message, res);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  const otp = Math.floor(1000 + Math.random() * 9000);
  if (user) {
    await User.updateOne({ _id: user._id }, { $set: { otp: otp } });
  } else {
    const newUser = new User({ email: email, otp: otp, new_user: true });
    await newUser.save();
  }

  return SuccessWithoutBody(200, `Otp code sent succesfully ${otp}`, res);
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.otpAttempts >= 3) {
      // Check if the user is within the 5-minute waiting period
      const currentTime = new Date();
      if (!user.retryTimestamp || currentTime < user.retryTimestamp) {
        // The user needs to wait for 5 minutes
        const timeRemaining = Math.ceil(
          (user.retryTimestamp - currentTime) / 1000
        );
        return res.status(400).json({
          message: `Please try again in 5 minutes later`,
        });
      } else {
        // Reset the OTP attempts count and the retry timer
        user.otpAttempts = 0;
        user.retryTimestamp = null;
      }
    }
    if (user.otp === otp) {
      if (user.name === "") {
        return successResponseVerifyOtp(200, "Verify Otp", user.new_user, res);
      } else {
        // return successResponse(200, "Verified successfully", user, res);
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
        const accesstoken = generateToken(user._id, user.name, user.email);
        const data = aggregatedUserData[0];
        // if ("new_user" in data) {
        //   delete data.new_user;
        // }
        const { new_user, ...dataWithoutNewUser } = data;
        return successResponseWithToken(
          200,
          "Logged in successfully",
          data.new_user,
          dataWithoutNewUser,
          accesstoken,
          res
        );
      }
    } else {
      user.otpAttempts++;

      if (user.otpAttempts >= 3) {
        // Set a 5-minute retry timer
        const currentTime = new Date();
        user.retryTimestamp = new Date(currentTime.getTime() + 5 * 60 * 1000); // 5 minutes in milliseconds
      }

      await user.save();
      return SuccessWithoutBody(400, "Invalid OTP", res);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  const otp = Math.floor(1000 + Math.random() * 9000);
  if (!user) {
    return SuccessWithoutBody(400, "invalid email adress", res);
  } else {
    await User.updateOne({ _id: user._id }, { $set: { otp: otp } });
  }

  return SuccessWithoutBody(200, "OTP code sent successfully", res);
});

// verify account

const approveUser = asyncHandler(async (req, response) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);

    // if user not found throw error
    if (!user) {
      throw new Error("user not found");
    } else {
    
      const updateuser = await User.findByIdAndUpdate(
        _id,
        {
          isVerify: true,
          new_user: false,
          name: "John ali"
        },
        { new: true }
      );
      return successResponse(
        200,
        "User approved successfully.",
        updateuser,
        response,
        "SUCCESS"
      );
    }
  } catch (err) {
   return PrintError(403, err.message, [], response, "FORBIDDEN");
  }
});




const deleteAccount = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;

    // Check if the user exists
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        data: null,
      });
    }

    // Delete the user account
    await User.findByIdAndDelete(_id);

    return res.status(200).json({
      status: 200,
      message: "Account deleted successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      data: null,
    });
  }
});

//home love
async function getAllUsers(req, res) {
  console.log("req.query.page  ----------------->", req.query.page)
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.per_page) || 3;
    const { age_from, age_to, country_id } = req.query; // Convert to an integer

    const startIndex = (page - 1) * limit;

    const user = await User.find().skip(startIndex).limit(limit);

    const ageFilter = {};
    if (age_from && age_to) {
      ageFilter.$gte = parseInt(age_from); // Greater than or equal to ageFrom
      ageFilter.$lte = parseInt(age_to); // Less than or equal to ageTo
    }

    const userFiltered = await User.find()
      .skip(startIndex)
      .limit(limit)
      .where("age")
      .gte(ageFilter.$gte)
      .lte(ageFilter.$lte);

    // Calculate the total number of users (for example)
    const totalUsersCount = await User.countDocuments();

    // Calculate metadata
    const lastPage = Math.ceil(totalUsersCount / limit);

    const aggregatedUsers = await User.aggregate([
      // { $match: { country: new mongoose.Types.ObjectId(country_id) } },
      // { $match: { age: ageFilter } }, // Apply age range filtering
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
      // {
      //   $lookup: {
      //     from: "relationdetails",
      //     localField: "_id",
      //     foreignField: "likedBy",
      //     as: "relation_detail",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$relation_detail",
      //   },
      // },
    ]);

    console.log("aggregatedUsers  -------------------->", aggregatedUsers)

    if (aggregatedUsers.length === 0) {
      return res.status(404).json({ status: 400, message: "No Data found" });
    }
    const response = {
      status: 200,
      message: "Fetched successfully",
      data: aggregatedUsers.map((user) => ({
        user: {
          id: user._id,
          name: user.name,
          age: user.age,
          country: {
            id: user.country._id,
            name: user.country.name,
            flag: user.country.flagUrl,
          },
          gender: user.gender,
          selfie: user.selfie_id,
          attachments: user.attachments.map((attachment) => ({
            id: attachment._id,
            name: attachment.name,
            url: attachment.url,
            type: attachment.type,
          })),
        },
        relation_details: {
          matched: user.relation_detail?.matched,
          liked: user.relation_detail?.liked,
          visited: user.relation_detail?.visited,
        },
      })),
      meta: {
        current_page: page,
        last_page: lastPage,
        per_page: limit,
        total: totalUsersCount,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("error fetching users:", error);

    res.status(500).json({ message: "server error" });
  }
}

const getUserById = asyncHandler(async (req, res) => {
  try {
    const userId = req.query.userId;

    // Ensure the requested user ID is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const aggregatedUser = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
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
      {
        $lookup: {
          from: "relationdetails",
          localField: "_id",
          foreignField: "likedBy",
          as: "relation_detail",
        },
      },
      {
        $unwind: {
          path: "$relation_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (aggregatedUser.length === 0) {
      return res.status(404).json({ status: 400, message: "User not found" });
    }

    const user = aggregatedUser[0];

    const response = {
      status: 200,
      message: "Fetched user successfully",
      data: {
        id: user._id,
        name: user.name,
        age: user.age,
        country: {
          id: user.country._id,
          name: user.country.name,
          flag: user.country.flagUrl,
        },
        gender: user.gender,
        selfie: user.selfie_id,
        attachments: user.attachments.map((attachment) => ({
          id: attachment._id,
          name: attachment.name,
          url: attachment.url,
          type: attachment.type,
        })),

        relation_details: {
          matched: user.relation_detail?.matched,
          liked: user.relation_detail?.liked,
          visited: user.relation_detail?.visited,
        },
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

//love user profile
const getLoginProfile = asyncHandler(async (req, response) => {
  try {
    const userId = req.user._id;
    const user = await getProfile(userId);
    if (!user) {
      throw new Error("user not found");
    }
    return successResponse(
      200,
      "Login User Found Successfully",
      user,
      response
    );
  } catch (err) {
    return PrintError(403, err.message, [], response, "FORBIDDEN");
  }
});

const profileUpdate = asyncHandler(async (req, response) => {
  try {
    const { selfie_id, attachments } = req.body;

    const userId = req.user._id;
    const user = await getProfile(userId);

    // if user not found throw error
    if (!user) {
      throw new Error("user not found");
    } else {
      const updateuser = await User.findByIdAndUpdate(
        userId,
        {
          selfie_id: selfie_id,
          attachments: attachments,
        },
        { new: true }
      );
      return successResponse(
        200,
        "Your profile has been updated successfully",
        updateuser,
        response,
        "SUCCESS"
      );
    }
  } catch (err) {
    return PrintError(403, err.message, [], response, "FORBIDDEN");
  }
});

//update configuration
const updateConfiguration = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user; // Assuming you include userId in the token during authentication
    const { device_id, device_type, timezone } = req.body;

    await verifyrequiredparams(
      400,
      req.body,
      ["device_id", "device_type", "timezone"],
      res
    );
    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { device_id, device_type, timezone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // res.json(updatedUser);
    return SuccessWithoutBody(200, "update successfully", res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// @desc  Login
// @route  auth/login
// @method  post
// @access  public
// const loginUser = asyncHandler(async (req, res) => {
//   try {
//     await verifyrequiredparams(400, req.body, ["email"], res);
//     const { email } = req.body;
//     let emaile = email.toLowerCase();

//     let profile = {};
//     const user = await User.findOne({ email: emaile });
//     if (!user) {
//       throw new Error("Incorrent Email");
//     }

//     if (user) {
//       profile = await getProfile(user._id);
//       const user_devices = await Devices.findOne({
//         // device_id: device_id,
//         user_id: user._id,
//       });
//       if (!user_devices) {
//         await Devices.create({
//           // device_id: device_id,
//           // device_type: device_type,
//           user_id: user._id,
//         });
//       }
//       // generate accesstoken
//       const html = "<h1>hello world</h1>";
//       await sendEmail("passim_cynic@yahoo.com", "TEST 123", html);
//       const accesstoken = generateToken(user._id, profile.name, emaile);
//       SuccessWithoutBody(
//         200,
//         "Otp code sent successfully",

//         res
//       );
//     } else {
//       throw new Error("Incorrent Email/Password Combinition");
//     }
//   } catch (error) {
//     return PrintError(400, error.message, res);
//   }
// });

// const resendActivationCode = asyncHandler(async (req, response) => {
//   try {
//     const { email } = req.body;
//     // generate random reset code
//     const resetcode = await verifyGenerateCode();
//     // find user by email
//     let emaile = email.toLowerCase();
//     const user = await User.findOne({ email: emaile });
//     // if user not found throw error
//     if (!user) {
//       throw new Error("Invalid user or user not found");
//     } else {
//       const now = new Date();
//       const lastResetSentAt = user.resetCodeSendTime || new Date(0);

//       // Check if 3 minutes have passed since the last reset code was sent
//       if (now - lastResetSentAt >= 3  60  1000) {
//         const htmlContent = fs.readFileSync(
//           __dirname + "/../email_temps/verify_account.html",
//           "utf8"
//         );

//         const activationLink = `${process.env.FRONTEND_DOMAIN}/verify-account?email=${user.email}&activation_code=${resetcode}`;

//         // Replace {{activation_code}} with the actual activation code
//         const modifiedHtmlContent = htmlContent
//           .replace("{{activation_link}}", activationLink)
//           .replace("{{button_text}}", "Verify");
//         const sendVerifyMail = {
//           to: emaile,
//           subject: `Resend Activation Code`,
//           template: modifiedHtmlContent,
//         };
//         await sendEmail(sendVerifyMail);
//         const updateuser = await User.updateOne(
//           { _id: user._id },
//           {
//             $set: {
//               activation_code: resetcode,
//               resetCodeSendTime: now,
//             },
//           }
//         );
//         return successResponse(
//           200,
//           "Activation Code Sent Successfully",
//           { code: resetcode },
//           response,
//           "SUCCESS"
//         );
//       } else {
//         const timeLeft = (3  60  1000 - (now - lastResetSentAt)) / 1000; // Convert to seconds
//         const timeLeftDisplay =
//           timeLeft < 60
//             ? `${timeLeft.toFixed(1)} seconds`
//             : `${(timeLeft / 60).toFixed(1)} minutes`;
//         return PrintError(
//           403,
//           "otp can only be resent after 3 mins.",
//           {
//             time_left: timeLeftDisplay,
//           },
//           response,
//           "FORBIDDEN"
//         );
//       }
//     }
//     // if user  found call forgot password function
//     // the response would be { code:1234}
//     // email is not being sent for now as there is no email provider
//   } catch (err) {
//     console.log(err);
//     return PrintError(403, err.message, [], response, "FORBIDDEN");
//   }
// });

const generateToken = (id, name, email) => {
  return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

// @desc  change password
// @route  auth/changepassword
// @method  post
// @access  public
const changePassword = asyncHandler(async (req, response) => {
  try {
    const user_id = req.user._id;
    const { old_password, newpassword, confirmpassword } = req.body;
    // get profile here
    const userdata = await User.findById(user_id);
    // if user not found throw error
    if (!userdata) {
      throw new Error("User Not Found");
    }
    // field check for new password and confrim password
    if (newpassword != confirmpassword) {
      throw new Error("Fields doesn't match");
    }
    // password lenght check
    if (newpassword.length < 6) {
      throw new Error("password cannot be less than 6 characters");
    }
    // generate new password
    const hashedPass = await bcrypt.hash(newpassword, 8);
    // generate new password
    const verifypassword = await bcrypt.compare(
      old_password,
      userdata.password
    );
    if (!verifypassword) {
      throw new Error("Incorrect old password");
    } else {
      const updatepassword = await User.updateOne(
        { _id: user_id },
        { $set: { password: hashedPass } }
      );
      return SuccessWithoutBody(200, "Pasword Updated Successfully", response);
    }
  } catch (err) {
    return await PrintError(400, err.message, response);
  }
});

/*
  |----------------------------------------------------------------------
  | FUNCTION @logout on the serverless.yml route 
  |----------------------------------------------------------------------
*/

const logout = asyncHandler(async (req, response) => {
  try {
    const { device_id } = req.body;
    const user_id = req.user._id;
    await Devices.deleteOne({ user_id: user_id, device_id: device_id });
    return SuccessWithoutBody(200, "Logged Out Successfully", response);
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});

/*
  |----------------------------------------------------------------------
  | FUNCTION @forgotpassword on the serverless.yml route 
  |----------------------------------------------------------------------
*/

const forgotpassword = asyncHandler(async (req, response) => {
  try {
    const { email } = req.body;
    // generate random reset code
    // const resetcode = (Math.floor(Math.random() * 10) + 1);
    const resetcode = Math.floor(Math.random() * 111111) + 100000;
    // find user by email
    let emaile = email.toLowerCase();
    const user = await User.findOne({ email: emaile });
    // if user not found throw error
    if (!user) {
      throw new Error("Invalid user or user not found");
    } else {
      const updateuser = await User.updateOne(
        { _id: user._id },
        { $set: { reset_code: resetcode } }
      );
      return successResponse(
        200,
        "Email Sent Successfully",
        { code: resetcode },
        response
      );
    }
    // if user  found call forgot password function
    // the response would be { code:1234}
    // email is not being sent for now as there is no email provider
  } catch (err) {
    console.log(err);
    return PrintError(400, err.message, response);
  }
});

const validatepin = asyncHandler(async (req, response) => {
  try {
    // get body from user and add to body constant
    await verifyrequiredparams(400, req.body, ["email", "pin"], response);
    const { email, pin } = req.body;
    let emaile = email.toLowerCase();
    // find user by email from body
    const user = await User.findOne({ email: emaile });
    // if user not found throw error else add user object to user1
    if (!user) {
      throw new Error("User not found");
    }
    // check pin from db and match it with user entered pin
    if (pin != user.reset_code && user.reset_code != 0) {
      throw new Error("Code doesnt match");
    }
    // check if user have requested for reset code or not
    if (user.reset_code == 0) {
      throw new Error("Forget Password Request not found");
    }
    if (user.reset_code == pin) {
      await User.updateOne({ _id: user._id }, { $set: { reset_code: "0" } });
      return SuccessWithoutBody(200, "Pin Verified Successfully", response);
    }
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});

/*
  |----------------------------------------------------------------------
  | FUNCTION @reset password on the serverless.yml route 
  |----------------------------------------------------------------------
*/

const resetpassword = asyncHandler(async (req, response) => {
  try {
    const { email, user_type, newpassword, retypenewpassword } = req.body;
    let emaile = email.toLowerCase();
    // find user by email
    const user = await User.findOne({ email: emaile, user_type: user_type });
    if (!user) {
      throw new Error("user not found");
    }
    // check if both password fields match
    if (newpassword !== retypenewpassword) {
      throw new Error("Fields doesnt match");
    }
    // check if password is less than 8 characters
    if (newpassword.length < 6) {
      throw new Error("Password Cannot be less than 6 characters");
    }
    // bcrypt is a library included for password encryption
    // generate encrypted password from user input
    const hashedPass = await bcrypt.hash(newpassword, 6);
    // update user password
    const updatepassword = await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPass } }
    );
    return SuccessWithoutBody(200, "Pasword reset Successfully", response);
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});

const updateTimeZone = asyncHandler(async (req, response) => {
  try {
    const user_id = req.user._id;
    const { timezone } = req.body;
    // find user by email
    const user = await User.findOne({ _id: user_id });
    if (!user) {
      throw new Error("user not found");
    }
    const updateTimezone = await User.updateOne(
      { _id: user_id },
      { $set: { timezone: timezone } }
    );
    return SuccessWithoutBody(200, "Timezone Updated Sucessfully", response);
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});

const preSignupCheck = asyncHandler(async (req, response) => {
  try {
    const { email, mobile_number } = req.body;
    await verifyrequiredparams(
      400,
      req.body,
      ["email", "mobile_number"],
      response
    );
    // find user by email
    const useremail = await User.findOne({ email: email });
    const phone = await User.findOne({ mobile: mobile_number });
    if (useremail) {
      throw new Error("email already exists");
    }
    // if (phone) {
    //     throw new Error('number already exists')
    // }
    else {
      const code = await getCode();
      const checkifexists = await PreSignup.findOne({
        email: email,
        mobile_number: mobile_number,
      });
      if (!checkifexists) {
        await PreSignup.create({
          email: email,
          mobile_number: mobile_number,
          code: code,
        });
      } else {
        await PreSignup.updateOne(
          { email: email, mobile_number: mobile_number },
          { $set: { code: code } }
        );
      }
      return SuccessWithoutBody(200, "Code sent successfully", response);
    }
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});

const preSignupVerification = asyncHandler(async (req, response) => {
  try {
    const { email, mobile_number, code } = req.body;
    await verifyrequiredparams(
      400,
      req.body,
      ["email", "mobile_number", "code"],
      response
    );
    // find user by email
    const useremail = await User.findOne({ email: email });
    const phone = await User.findOne({ mobile: mobile_number });
    if (useremail) {
      throw new Error("email already exists");
    }
    if (phone) {
      throw new Error("number already exists");
    } else {
      const checkifexists = await PreSignup.findOne({
        email: email,
        mobile_number: mobile_number,
        code: code,
      });
      if (!checkifexists) {
        throw new Error("invalid code");
      } else {
        await PreSignup.deleteOne({
          email: email,
          mobile_number: mobile_number,
          code: code,
        });
        return SuccessWithoutBody(200, "Code Verified successfully", response);
      }
    }
  } catch (err) {
    return PrintError(400, err.message, response);
  }
});

const testSocketio = asyncHandler(async (req, res) => {
  //Whenever someone connects this gets executed
  io.on("connection", function (socket) {
    console.log("A user connected");

    //Whenever someone disconnects this piece of code executed
    socket.on("disconnect", function () {
      console.log("A user disconnected");
    });
  });
});

const getFaq = asyncHandler(async (req, res) => {
  try {
    const data = await FAQ.find(
      {},
      { user_id: 0 },
      { sort: { created_at: -1 } }
    );
    if (data.length > 0) {
      return successResponse(200, "Fetched Successfully", data, res);
    } else {
      throw new Error("Nothing found");
    }
  } catch (err) {
    return PrintError(400, err.message, res);
  }
});

const getPrivacy = asyncHandler(async (req, res) => {
  try {
    const data = await Settings.findOne({}, { privacy: 1, _id: 0 });
    if (data) {
      return successResponse(200, "Fetched Successfully", data, res);
    } else {
      throw new Error("Nothing found");
    }
  } catch (err) {
    return PrintError(400, err.message, res);
  }
});

const getTerms = asyncHandler(async (req, res) => {
  try {
    const data = await Settings.findOne({}, { tac: 1, _id: 0 });
    if (data) {
      return successResponse(200, "Fetched Successfully", data, res);
    } else {
      throw new Error("Nothing found");
    }
  } catch (err) {
    return PrintError(400, err.message, res);
  }
});

const getAbout = asyncHandler(async (req, res) => {
  try {
    const data = await Settings.findOne({}, { about: 1, _id: 0 });
    if (data) {
      return successResponse(200, "Fetched Successfully", data, res);
    } else {
      throw new Error("Nothing found");
    }
  } catch (err) {
    return PrintError(400, err.message, res);
  }
});

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  logout,
  forgotpassword,
  validatepin,
  approveUser,
  resetpassword,
  updateTimeZone,
  preSignupCheck,
  preSignupVerification,
  testSocketio,
  getFaq,
  getPrivacy,
  getTerms,
  getAbout,
  getAllUsers,
  verifyOtp,
  resendOtp,
  deleteAccount,
  getLoginProfile,
  profileUpdate,
  getUserById,
  updateConfiguration,
};
