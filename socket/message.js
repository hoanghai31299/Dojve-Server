const jwt = require("jsonwebtoken");
const User = require("../models/users.model");
const messageController = require("../controllers/message.controller");
const userController = require("../controllers/user.controller");
module.exports = function (io) {
  io.use(function (socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        process.env.JWT_TOKEN_SECRET,
        function (err, decoded) {
          console.log("conecting...");
          if (err) return next(new Error("Authentication error"));
          let _id = decoded.user._id;
          User.findById(_id)
            .populate("friends")
            .exec((err, user) => {
              socket.user = user;
              next();
            });
        }
      );
    } else {
      next(new Error("Authentication error"));
    }
  }).on("connection", (socket) => {
    socket.join(socket.user._id);
    console.log(`user ${socket.user.name} join to ${socket.user._id}`);
    User.findByIdAndUpdate(
      socket.user._id,
      { $set: { status: 1 } },
      { new: true }
    ).then((user) => console.log(user.status));
    socket.on("join", (room) => {
      console.log(`user ${socket.user.name} join to ${room._id}`);
      socket.join(room._id);
      io.sockets.in(room._id).emit("user-online", {
        room: room._id,
        user: socket.user._id,
      });
      socket.on("disconnect", async () => {
        io.sockets.in(room._id).emit("user-offline", {
          room: room._id,
          user: socket.user._id,
        });
      });
    });
    socket.on("forceDisconnect", () => {
      socket.disconnect();
      User.findByIdAndUpdate(
        socket.user._id,
        { $set: { status: 0 } },
        { new: true }
      ).then((user) => {});
      console.log(`user ${socket.user.name} has been disconect`);
    });
    socket.on("disconnect", () => {
      socket.disconnect();
      User.findByIdAndUpdate(
        socket.user._id,
        { $set: { status: 0 } },
        { new: true }
      ).then((user) => {});
      console.log(`user ${socket.user.name} has been disconect`);
    });

    socket.on("messages", async (data, callback) => {
      try {
        if (!data) return callback(new Error("INVALID_DATA"));
        switch (data.action) {
          case "SEND":
            return await newMessage(io, socket, data.message, callback);
          case "SEND_TYPING": {
            socket.to(data.to).emit("messages", {
              action: "RECEIVE_TYPING",
              to: data.to,
              sender: socket.user.name,
            });
            return callback(null, data);
          }
          case "SEND_DONE_TYPING": {
            socket.to(data.to).emit("messages", {
              action: "RECEIVE_DONE_TYPING",
              to: data.to,
            });
            return callback(null, data);
          }
        }
      } catch (error) {
        return callback(error, null);
      }
    });
  });
};

const newMessage = async (io, socket, message, callback) => {
  message.createdAt = new Date();
  io.to(message.to).emit("messages", {
    action: "RECEIVE",
    message,
  });
  const res = await messageController.createMessage(
    {
      body: {
        message,
      },
      user: socket.user,
    },
    {},
    callback
  );

  return callback(null, message);
};
