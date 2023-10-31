const express = require('express');
const router = express.Router();
const { registerUser, loginUser, changePassword, logout, forgotpassword, validatepin, resetpassword, updateTimeZone, preSignupCheck, preSignupVerification, testSocketio, getFaq, getPrivacy, getTerms, getAbout } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
router.post('/signup', registerUser)
    .post('/login', loginUser)
    .put('/changepassword', protect, changePassword)
    .post('/logout', protect, logout)
    .put('/forgotpassword', forgotpassword)
    .put('/validatepin', validatepin)
    .put('/resetpassword', resetpassword)
    .put('/timezone', protect, updateTimeZone)
    .post('/signup/pre', preSignupCheck)
    .post('/signup/verify', preSignupVerification)
    .post('/socket', protect, testSocketio).get('/faq', getFaq).get('/privacy', getPrivacy).get('/terms', getTerms).get('/about', getAbout);

module.exports = router