const User = require("../models/users.model");
const Room = require("../models/rooms.model");

module.exports = {
  newRequest: async (req, res, next) => {
    try {
      const { to } = req.params;
      const sender = req.user;
      const user = await User.findOneAndUpdate(
        {
          _id: to,
          friendRequests: { $nin: sender._id },
          friends: { $nin: sender._id },
        },
        {
          $push: {
            friendRequests: sender._id,
          },
        }
      );
      if (!user) {
        return res.status(200).json({
          error: true,
          message: "request has been send before",
        });
      }
      if (user._id == sender._id) {
        return res.status(200).json({
          error: true,
          message: "You can't send request to yourself",
        });
      }
      return res.status(200).json({
        error: false,
        message: "Request sent",
      });
    } catch (error) {
      next(error);
    }
  },
  declineRequest: async (req, res, next) => {
    const { to } = req.params;
    const user = req.user;
    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $pull: {
          friendRequests: to,
        },
      }
    );
    return res.status(200).json({
      error: false,
      message: "Request accepted",
    });
  },
  acceptRequest: async (req, res, next) => {
    const { to } = req.params;
    const user = req.user;
    let checkFR = false;
    for (userRq of user.friendRequests) {
      if (userRq == to) {
        checkFR = true;
      }
    }
    if (!checkFR) {
      return res.status(200).json({
        error: true,
        message: "The guy not send friend request",
      });
    }
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
    return res.status(200).json({
      error: false,
      message: "Request accepted",
    });
  },
  getListFriend: async (req, res, next) => {
    try {
      const user = req.user;
      const userFriend = await User.findById(user._id, "friends")
        .populate("friends")
        .lean();

      return res.status(200).json({
        error: false,
        message: "Get list friend successful",
        friends: userFriend.friends,
      });
    } catch (error) {
      next(error);
    }
  },
  getListFriendRequest: async (req, res, next) => {
    try {
      const user = req.user;
      const userRequest = await User.findById(user._id, "friendRequests")
        .populate("friendRequests")
        .lean();
      return res.status(200).json({
        error: false,
        message: "Get list friend request successful",
        requests: userRequest.friendRequests,
      });
    } catch (error) {
      next(error);
    }
  },
  getUser: async (req, res, next) => {
    try {
      const { _id } = req.params;
      const user = await User.findOne({ _id, deleteAt: undefined }).populate(
        "friends friendRequest"
      );
      if (!user) {
        return res.status(200).json({
          error: true,
          message: "User is not found",
        });
      }
      return res.status(200).json({
        error: false,
        message: "Get detail user successful",
        user,
      });
    } catch (error) {
      next(error);
    }
  },
  getAllUser: async (req, res, next) => {
    try {
      const users = await User.find({
        _id: { $ne: req.user._id },
      })
        .where("_id")
        .nin(req.user.friends)
        .select("-password -friends -friendRequests");
      return res.status(200).json({
        error: false,
        message: "Get detail user successful",
        users,
      });
    } catch (error) {
      next(error);
    }
  },
  updateUser: async (req, res, next) => {
    try {
      const { _id } = req.params;
      const user = req.user;
      const { name, status, gender, dop } = req.body;
      if (_id != user._id) {
        return res.status(200).json({
          error: true,
          message: "You can`t update this user",
        });
      }
      const edUser = await User.findOne({ _id, deleteAt: undefined });
      if (!edUser) {
        return res.status(200).json({
          error: true,
          message: "User is not found",
        });
      }
      const userUpdated = await User.findByIdAndUpdate(
        _id,
        { name, status, gender, dop },
        { new: true }
      );
      return res.status(200).json({
        error: false,
        message: "Update user successful",
        userUpdated,
      });
    } catch (error) {
      next(error);
    }
  },
  searchEmailUsers: async (req, res, next) => {
    try {
      const { email } = req.query;
      const user = await User.find({ email: { $regex: email, $options: "i" } });
      return res.status(200).json({
        error: false,
        message: "Search user by email successful",
        user,
      });
    } catch (error) {
      next(error);
    }
  },
};
