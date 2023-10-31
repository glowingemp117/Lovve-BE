const mongoose = require('mongoose');

const preSignupSchema = new mongoose.Schema({
    email: String,
    mobile_number: String,
    code: Number,
}, {
    timestamps: true,
})

module.exports = mongoose.model('pre_signup', preSignupSchema);