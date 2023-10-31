const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    mobile: {
        type: String,
        default: "",
    },
    telephone: {
        type: String,
        default: "",
    },
    user_type: {
        type: Number,
        default: 1
    },
    timezone: {
        type: String,
        default: "",
    },
    image: {
        type: String,
        default: "noImg.png",
    },
    reset_code: {
        type: String,
        default: "",
    },
    rating: {
        type: String,
        default: "",
    },
    status: {
        type: Boolean,
        default: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
    employer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        default: null
    },
    is_approved: {
        type: String,
        default: "0",
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    admin_input: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model("users", UserSchema)