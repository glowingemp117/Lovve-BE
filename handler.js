// const serverless = require("serverless-http");
const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
var cors = require("cors");
const { errorHandler } = require("./backend/middleware/errorMiddleware");
// const { logger } = require('./backend/middleware/logMiddleware');
const db = require("./backend/config/db");
const colors = require("colors");
var busboy = require("connect-busboy");
// const fileUpload = require("express-fileupload");
var path = require("path");
const morganBody = require("morgan-body");
const fs = require("fs");
var cron = require("node-cron");

const Conversation = require("./backend/schemas/Conversations");
const mongoose = require("mongoose");

const {
  socketMongoPOST,
  getSocketUsingSocket_id,
  deleteAll,
  getuser_idFromSocket_id,
  getUserTypeByUserId,
  sendNotificationUserOffline,
  getUserByUserId,
} = require("./backend/controllers/socketController");
// app.use(
//   fileUpload({
//     createParentPath: true,
//   })
// );
const moment = require("moment-timezone");
// load db
db();
const date = moment().format("YYYY-MM-DD");
const accessLogStream = fs.createWriteStream(
  path.join(__dirname + "/backend/logs/", `access_${date}.log`),
  { flags: "a" }
);

// app.use(busboy());
morganBody(app, {
  logAllReqHeader: true,
  maxBodyLength: 5000,
  stream: accessLogStream,
});

app.use(cors());
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve("backend/uploads")));

app.use("/auth", require("./backend/routes/userRoutes"));
app.use("/countries", require("./backend/routes/countriesRoutes"));
app.use("/uploadFile", require("./backend/routes/attachmentRoute"));
app.use("/", require("./backend/routes/profileLiked"));
app.use("/", require("./backend/routes/reportUserRoute"));
app.use("/support", require("./backend/routes/supportRoute"));
app.use("/privacyPolicy", require("./backend/routes/privacyPolicyRoute"));
app.use("/terms", require("./backend/routes/termsRoute"));
app.use("/", require("./backend/routes/subscriptionRoutes"));

app.use("/file", require("./backend/routes/fileHandlingRouter"));
app.use("/conversation", require("./backend/routes/conversationRoutes"));
app.use(errorHandler);
app.use((req, res, next) => {
  return res.status(404).json({
    error: "Route Not Found",
  });
});

(async () => {
  const app = require("express")();
  const server = require("http").createServer(app);
  const io = require("socket.io")(server);

  io.on("connection", async (socket) => {
    console.log("Connected - Server");

    const query = socket.handshake.query;
    // console.log(query);
    const user_id = query.user_id;
    const socket_id = socket.id;
    if (!user_id) {
      socket.disconnect(true);
    }
    await socketMongoPOST(socket_id, user_id, "create");

    socket.on("disconnect", async () => {
      await socketMongoPOST(socket_id, user_id, "delete");
      console.log("Disconnected - Server");
    });

    socket.on("message", async (data) => {
      const sender_id = await getSocketUsingSocket_id(null, data.to);
      const sender_idd = data.to;
      const getworkerType = await getUserTypeByUserId(data.to);
      let employer_id;
      let worker_id;
      if (getworkerType == 2) {
        employer_id = user_id;
        worker_id = sender_idd;
      }
      if (getworkerType == 1) {
        employer_id = sender_idd;
        worker_id = user_id;
      }
      data.timesince = moment().fromNow();
      const messageObj = {
        sender: new mongoose.Types.ObjectId(data.sender_id),
        message: data.payload,
      };
      await Conversation.updateOne(
        { worker_id, employer_id },
        { $push: { messages: messageObj } }
      );
      if (sender_id && sender_id != null && sender_id != undefined) {
        io.to(sender_id)?.emit("message", data);
      } else {
        const user = await getUserByUserId(user_id);
        const notification_obj = {
          title: `${user.name}`,
          message: data.payload,
          body: data.payload,
          object: messageObj,
          type: "conversation",
          status: 4,
          color: "#fff",
        };
        await sendNotificationUserOffline(data.to, notification_obj);
      }
    });
  });

  server.listen(process.env.PORT_SOCKETIO);

  process.on("exit", async () => {
    await deleteAll();
  });
})();

// server.listen(process.env.PORT_SOCKETIO, () => {
//   console.log(`socketio connected on port: ${process.env.PORT_SOCKETIO}`);
// });

app.listen(process.env.PORT, () =>
  console.log(
    `Server listening in port ${process.env.PORT} url: http://localhost:${process.env.PORT}`
  )
);

// module.exports.api = serverless(app);
