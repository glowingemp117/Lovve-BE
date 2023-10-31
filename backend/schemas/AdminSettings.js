const mongoose = require('mongoose');



const AdminSettings = new mongoose.Schema({
    VAT: Number,
    NI: Number,
    faq: mongoose.Schema.Types.Mixed,
    job_reposting: Number,
    tac: String,
    privacy: String,
    about: String,
    min_break: Number,
    fee: Number,
    student_max_hours_week: Number,
    student_max_hours_daily: Number,
    max_hours_weekly: Number,
    max_hours_daily: Number,
    min_hour_job:Number,
    max_hour_job:Number,
    rest_period:Number,
    timeBetweenJobsMins:Number
}, {
    timestamps: true,
})

module.exports = mongoose.model('admin_settings', AdminSettings);