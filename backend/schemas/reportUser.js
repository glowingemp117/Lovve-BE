const mongoose = require("mongoose");

const reportUserSchema = new mongoose.Schema({
    reportBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    reportTo: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

module.exports = mongoose.model("reportuser", reportUserSchema);
