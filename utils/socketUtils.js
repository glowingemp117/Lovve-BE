module.exports.sendSocketMessage = async ({ event, data }) => {
  const { socket } = require("../index");
  socket.emit(event, data);
};
