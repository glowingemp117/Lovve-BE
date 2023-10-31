const http = require("http");
const { Server } = require("socket.io");
const config = require("config");

const jwtUtil = require("./utils/jwtUtils");
const { UsersServices } = require("./services");
const { socketConstants } = require("./constants");
const { sendSocketMessage } = require("./utils");
let socketsArr = [];

module.exports.prepare = (app) => {
  const server = http.createServer(app);

  const cors = {
    origin: "*",
  };

  const io = new Server(server, {
    cors,
  });

  const jwtMiddleware = (socket, next) => {
    const { token } = socket.handshake.query;
    // verify token
    const decodedObj = jwtUtil.verify(token);
    if (decodedObj) {
      next();
    } else {
      console.log("Socket cannot be authenticated");
    }
  };
  io.use(jwtMiddleware);

  const PORT = config.get("port") || 3001;
  server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));

  io.on("connection", async (socket) => {
    console.log(`New client connected to socket`);

    const { token } = socket.handshake.query;
    const decodedObj = jwtUtil.verify(token);
    if (decodedObj) {
      const user = await UsersServices.getUserById({ id: decodedObj.id });
      if (!user.isActive) {
        sendSocketMessage({
          event: socketConstants.inActive,
          data: { userID: decodedObj.id },
        });
      }
    }

    socketsArr.push(socket);

    socket.on("disconnect", () => {
      console.log(`Client disconnected from socket`);
    });
  });

  return io;
};
