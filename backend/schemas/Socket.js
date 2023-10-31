/**
 * Sample schema
 *  @author glowingemp101
 */
const mongoose = require("mongoose");

const socketSchema = new mongoose.Schema(
    {
        user_id: {
            // type: mongoose.Schema.Types.ObjectId,
            // ref: "users",
            type: String
        },
        socket_id: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

// Model
module.exports = mongoose.model("socket", socketSchema);