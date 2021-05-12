const userController = require("../controllers/user.controller");
const User = require("../models/users.model");
const Room = require("../models/rooms.model");
const { findById } = require("../models/users.model");
module.exports = function (io) {
  io.on("connection", (socket, next) => {
    socket.on("friends", async (data, callback) => {
      try {
        if (!data) return callback(new Error("INVALID_DATA"));
        switch (data.action) {
          case "SEND":
            return await sendRequest(io, socket, data, callback);
          case "ACCEPT":
            return await acceptRequest(io, socket, data, callback);
          case "ADD_GROUP":
            return await newRoom(io, socket, data, callback);
          default:
        }
      } catch (error) {
        return callback(error, null);
      }
    });
  });
};

const sendRequest = async (io, socket, data, callback) => {
  try {
    io.emit(data.to, {
      action: "RECEIVE",
      user: socket.user,
    });
    const res = await userController.newRequest(
      {
        params: {
          to: data.to,
        },
        user: socket.user,
      },
      null,
      callback
    );
    return callback(null, res);
  } catch (error) {
    return callback(error, error.message);
  }
};

const acceptRequest = async (io, socket, data, callback) => {
  try {
    const { to } = data;
    const user = socket.user;
    io.emit(data.to, {
      action: "ACCEPT_REQUEST",
      user: socket.user,
    });
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $pull: {
          friendRequests: to,
        },
        $push: {
          friends: to,
        },
      }
    );
    await User.findOneAndUpdate(
      { _id: to },
      {
        $pull: {
          friendRequests: user._id,
        },
        $push: {
          friends: user._id,
        },
      }
    );
    const newRoom = new Room({
      members: [to, user._id],
    });
    await newRoom.save();
    const room = await Room.findById(newRoom._id).populate({
      path: "members lastMessage",
    });
    io.emit(data.to, {
      action: "ACCEPT_REQUEST",
      room,
    });
    return callback(null, room);
  } catch (error) {
    console.log(error);
    return callback(error, error.message);
  }
};

const newRoom = async (io, socket, data, callback) => {
  const { to, room } = data;
  console.log(to);
  const user = socket.user;
  to.forEach((id) => {
    console.log(id);
    io.emit(id, {
      action: "JOIN_ROOM",
      room,
      user,
    });
  });
};
