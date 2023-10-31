const asyncHandler = require('express-async-handler');
const { successResponse, SuccessWithoutBody, PrintError, verifyrequiredparams, sendNotification } = require('../middleware/common');
const User = require('../schemas/User');
const FAQ = require('../schemas/FAQ');
const Settings = require('../schemas/AdminSettings');
const PreSignup = require('../schemas/PreSignup');
const Devices = require('../schemas/Devices');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getProfile } = require('../helpers/UserHelper');
const { sendEmail } = require('../middleware/sendEmail');
const { getCode } = require('../helpers/UserHelper');

// @desc  Register new user
// @route  auth/signup
// @method  post
// @access  public
const registerUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, timezone, device_id, mobile, device_type, user_type } = req.body;
        await verifyrequiredparams(400, req.body, ['name', 'email', 'password', 'mobile', 'timezone', 'device_id', 'device_type', 'user_type'], res);
        let emaile = email.toLowerCase();
        const userExists = await User.findOne({ email: emaile })
        if (userExists) {
            throw new Error("User already exists");
        }
        if (device_type.toLowerCase() != "android" && device_type.toLowerCase() != "ios") {
            // throw error if device is not android or ios
            throw new Error("Invalid device_type entered only values accepted are ios/android");
        }
        if (password.length < 6) {
            throw new Error("Password too short, min 6 chacters required");
        }
        // hash password or encrypt password
        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(password, salt)
        // create user
        const user = await User.create({ name: name, email: emaile, user_type: user_type, password: hashedpassword, timezone: timezone, mobile: mobile, status: true });
        if (user) {
            await Devices.create({ user_id: user._id, device_id: device_id, device_type: device_type });
            let profile = {};
            // check if user being created is worker or user_type == 2
            if (user.user_type == 2) {
                profile = await getProfile(user._id);
            }
            //check if user created is employer or user_type == 1
            if (user.user_type == 1) {
                profile = await getProfile(user._id);
            }
            // const html = "<h1>hello world</h1>"
            // await sendEmail('passim_cynic@yahoo.com', "TEST 123", html)
            const accesstoken = generateToken(user._id, profile.name, emaile)
            const notification_obj = {
                title: "title",
                message: `message`,
                body: `message`,
                type: "signup",
                status: "0",
                color: "#fff",
                object: {
                }
            };
            await sendNotification(user._id, notification_obj);
            successResponse(201, "Signup successfully", {
                ...profile
                , accesstoken
            }, res)
        }
        else {
            throw new Error("Something Went Wrong while creating user");
        }

    } catch (error) {
        return PrintError(400, error.message, res);
    }
})

// @desc  Login
// @route  auth/login
// @method  post
// @access  public
const loginUser = asyncHandler(async (req, res) => {
    try {
        await verifyrequiredparams(400, req.body, ['email', 'password', 'timezone', 'device_id', 'device_type', 'user_type'], res);
        const { email, password, timezone, device_id, device_type, user_type } = req.body;
        let emaile = email.toLowerCase();
        if (device_type.toLowerCase() != "android" && device_type.toLowerCase() != "ios") {
            // throw error if device is not android or ios
            throw new Error("Invalid device_type entered only values accepted are ios/android");
        }
        if (password.length < 6) {
            throw new Error("Password too short, min 6 chacters required");
        }
        let profile = {}
        const user = await User.findOne({ email: emaile, user_type: user_type })
        if (!user) {
            throw new Error('Incorrent Email/Password Combinition');
        }
        if (user.timezone != timezone) {
            User.updateOne({ _id: user._id }, { $set: { timezone: timezone } })
        }
        if (user && (await bcrypt.compare(password, user.password))) {
                profile = await getProfile(user._id);
            const user_devices = await Devices.findOne({ device_id: device_id, user_id: user._id })
            if (!user_devices) {
                await Devices.create({ device_id: device_id, device_type: device_type, user_id: user._id });
            }
            // generate accesstoken
            const html = "<h1>hello world</h1>"
            await sendEmail('passim_cynic@yahoo.com', "TEST 123", html)
            const accesstoken = generateToken(user._id, profile.name, emaile,)
            successResponse(200, "Loggedin Successfully", { ...profile, accesstoken }, res)
        }
        else {
            throw new Error('Incorrent Email/Password Combinition');
        }
    } catch (error) {
        return PrintError(400, error.message, res);
    }
})


const generateToken = (id, name, email) => {
    return jwt.sign({ id, name, email }, process.env.JWT_SECRET, { expiresIn: '3d' })
}




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
            throw new Error("User Not Found")
        }
        // field check for new password and confrim password
        if (newpassword != confirmpassword) {
            throw new Error("Fields doesn't match")
        }
        // password lenght check
        if (newpassword.length < 6) {
            throw new Error("password cannot be less than 6 characters")
        }
        // generate new password
        const hashedPass = await bcrypt.hash(newpassword, 8)
        // generate new password
        const verifypassword = await bcrypt.compare(old_password, userdata.password)
        if (!verifypassword) {
            throw new Error("Incorrect old password")
        }
        else {
            const updatepassword = await User.updateOne({ _id: user_id }, { $set: { password: hashedPass } });
            return SuccessWithoutBody(200, 'Pasword Updated Successfully', response);
        }
    } catch (err) {
        return await PrintError(400, err.message, response);
    }
})



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
        return SuccessWithoutBody(200, 'Logged Out Successfully', response);
    } catch (err) {
        return PrintError(400, err.message, response);
    }
})


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
            throw new Error("Invalid user or user not found")
        }
        else {
            const updateuser = await User.updateOne({ _id: user._id }, { $set: { reset_code: resetcode } });
            return successResponse(200, 'Email Sent Successfully', { code: resetcode }, response);
        }
        // if user  found call forgot password function
        // the response would be { code:1234}
        // email is not being sent for now as there is no email provider
    } catch (err) {
        console.log(err);
        return PrintError(400, err.message, response)
    }
})

const validatepin = asyncHandler(async (req, response) => {
    try {
        // get body from user and add to body constant
        await verifyrequiredparams(400, req.body, ['email', 'pin'], response)
        const { email, pin } = req.body;
        let emaile = email.toLowerCase();
        // find user by email from body
        const user = await User.findOne({ email: emaile });
        // if user not found throw error else add user object to user1
        if (!user) {
            throw new Error('User not found');
        }
        // check pin from db and match it with user entered pin
        if (pin != user.reset_code && user.reset_code != 0) {
            throw new Error('Code doesnt match');
        }
        // check if user have requested for reset code or not 
        if (user.reset_code == 0) {
            throw new Error('Forget Password Request not found')
        }
        if (user.reset_code == pin) {
            await User.updateOne({ _id: user._id }, { $set: { reset_code: '0' } });
            return SuccessWithoutBody(200, 'Pin Verified Successfully', response);
        }
    } catch (err) {
        return PrintError(400, err.message, response)
    }
})


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
            throw new Error('user not found')
        }
        // check if both password fields match 
        if (newpassword !== retypenewpassword) {
            throw new Error('Fields doesnt match')
        }
        // check if password is less than 8 characters
        if (newpassword.length < 6) {
            throw new Error('Password Cannot be less than 6 characters');
        }
        // bcrypt is a library included for password encryption
        // generate encrypted password from user input
        const hashedPass = await (bcrypt.hash(newpassword, 6));
        // update user password
        const updatepassword = await User.updateOne({ _id: user._id }, { $set: { password: hashedPass } });
        return SuccessWithoutBody(200, 'Pasword reset Successfully', response);
    } catch (err) {
        return PrintError(400, err.message, response);
    }
})


const updateTimeZone = asyncHandler(async (req, response) => {
    try {
        const user_id = req.user._id;
        const { timezone } = req.body;
        // find user by email
        const user = await User.findOne({ _id: user_id });
        if (!user) {
            throw new Error('user not found')
        }
        const updateTimezone = await User.updateOne({ _id: user_id }, { $set: { timezone: timezone } });
        return SuccessWithoutBody(200, 'Timezone Updated Sucessfully', response);
    } catch (err) {
        return PrintError(400, err.message, response);
    }
})


const preSignupCheck = asyncHandler(async (req, response) => {
    try {
        const { email, mobile_number } = req.body;
        await verifyrequiredparams(400, req.body, ['email', 'mobile_number'], response);
        // find user by email
        const useremail = await User.findOne({ email: email });
        const phone = await User.findOne({ mobile: mobile_number });
        if (useremail) {
            throw new Error('email already exists')
        }
        // if (phone) {
        //     throw new Error('number already exists')
        // }
        else {
            const code = await getCode();
            const checkifexists = await PreSignup.findOne({ email: email, mobile_number: mobile_number })
            if (!checkifexists) {
                await PreSignup.create({ email: email, mobile_number: mobile_number, code: code })
            }
            else {
                await PreSignup.updateOne({ email: email, mobile_number: mobile_number }, { $set: { code: code } })

            }
            return SuccessWithoutBody(200, "Code sent successfully", response);
        }
    } catch (err) {
        return PrintError(400, err.message, response);
    }
})


const preSignupVerification = asyncHandler(async (req, response) => {
    try {
        const { email, mobile_number, code } = req.body;
        await verifyrequiredparams(400, req.body, ['email', 'mobile_number', 'code'], response);
        // find user by email
        const useremail = await User.findOne({ email: email });
        const phone = await User.findOne({ mobile: mobile_number });
        if (useremail) {
            throw new Error('email already exists')
        }
        if (phone) {
            throw new Error('number already exists')
        }
        else {
            const checkifexists = await PreSignup.findOne({ email: email, mobile_number: mobile_number, code: code })
            if (!checkifexists) {
                throw new Error('invalid code');
            }
            else {
                await PreSignup.deleteOne({ email: email, mobile_number: mobile_number, code: code })
                return SuccessWithoutBody(200, 'Code Verified successfully', response);
            }
        }
    } catch (err) {
        return PrintError(400, err.message, response);
    }
})



const testSocketio = asyncHandler(async (req, res) => {

    //Whenever someone connects this gets executed
    io.on('connection', function (socket) {
        console.log('A user connected');

        //Whenever someone disconnects this piece of code executed
        socket.on('disconnect', function () {
            console.log('A user disconnected');
        });
    });
})


const getFaq = asyncHandler(async (req, res) => {
    try {
        const data = await FAQ.find({}, { user_id: 0 }, { sort: { created_at: -1 } });
        if (data.length > 0) {
            return successResponse(200, 'Fetched Successfully', data, res);
        }
        else {
            throw new Error('Nothing found')
        }

    } catch (err) {
        return PrintError(400, err.message, res);

    }
})


const getPrivacy = asyncHandler(async (req, res) => {
    try {
        const data = await Settings.findOne({}, { privacy: 1, _id: 0 });
        if (data) {
            return successResponse(200, 'Fetched Successfully', data, res);
        }
        else {
            throw new Error('Nothing found')
        }

    } catch (err) {
        return PrintError(400, err.message, res);

    }
})

const getTerms = asyncHandler(async (req, res) => {
    try {
        const data = await Settings.findOne({}, { tac: 1, _id: 0 });
        if (data) {
            return successResponse(200, 'Fetched Successfully', data, res);
        }
        else {
            throw new Error('Nothing found')
        }

    } catch (err) {
        return PrintError(400, err.message, res);

    }
})

const getAbout = asyncHandler(async (req, res) => {
    try {
        const data = await Settings.findOne({}, { about: 1, _id: 0 });
        if (data) {
            return successResponse(200, 'Fetched Successfully', data, res);
        }
        else {
            throw new Error('Nothing found')
        }

    } catch (err) {
        return PrintError(400, err.message, res);

    }
})


module.exports = { registerUser, loginUser, changePassword, logout, forgotpassword, validatepin, resetpassword, updateTimeZone, preSignupCheck, preSignupVerification, testSocketio, getFaq, getPrivacy, getTerms, getAbout }
