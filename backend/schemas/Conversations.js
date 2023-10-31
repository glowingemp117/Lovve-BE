/**
 * Sample schema
 *  @author glowingemp101
 */
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({

    employer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    worker_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    status: String
},
    {
        timestamps: true,
    });

// Model
module.exports = mongoose.model("conversations", conversationSchema);