const mongoose = require("mongoose");
const config = require("config");

mongoose.Promise = global.Promise;

mongoose.set("strictQuery", true);

mongoose.connect(config.get(`mongo.${config.get("env")}.uri`));

const conn = mongoose.connection;

conn.on("error", () => console.log("connection error"));

conn.on("open", () => console.log("Connected to MongoDB"));

module.exports = conn;
