module.exports = function (io) {
  io.on("connection", (socket, next) => {
    socket.on("videocall", (data, callback) => {
      switch (data.action) {
        case "startCall": {
          return startCall(socket, data, callback);
        }
        case "declineCall": {
          return declineCall(socket, data, callback);
        }
      }
    });
  });
};

const startCall = (socket, data, callback) => {
  socket.to(data.roomId).emit("videocall", {
    action: "RECEIVE",
    aToken: data.aToken,
    sid: data.sid,
    caller: socket.user,
    video: data.video,
  });
  callback(null, "success");
};

const declineCall = (socket, data, callback) => {
  socket.to(data.roomId).emit("declineCall", {
    user: {
      _id: socket.user._id,
      name: socket.user.name,
    },
  });
};
