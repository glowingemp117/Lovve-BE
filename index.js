require("dotenv").config();

const config = require("config");

const app = require("./app");
const { mongoose } = require("./models"); // import connection
const socket = require("./socket");
const { cronJobsUtils } = require("./utils");

const io = socket.prepare(app);
const socketFlag = config.get("socket");
app.set(socketFlag, io);
module.exports.socket = app.get(socketFlag);

if (config.get("env") == config.get("envVariables.prod")) {
  // cronJobsUtils.setupAwakeJob(config.get('awakeJobFrequencyInMinutes'));
}

if (config.get("env") == config.get("envVariables.dev")) {
  const testOnDevelopment = async () => {
    try {
      // const playground = require('./playGround');
    } catch (err) {
      console.dir(err, { depth: null });
    }
  };

  testOnDevelopment();
}
