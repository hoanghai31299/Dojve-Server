const Room = require("../models/rooms.model");
const Message = require("../models/messages.model");
const crypto = require("crypto-js");
exports.getAllRooms = async(req, res, next) => {
    try {
        const { _id } = req.user;
        const rooms = await Room.find({ members: _id })
            .populate({
                path: "members lastMessage lastMessage.sender",
                select: "-password -friends -friendRequests",
            })
            .sort("-updatedAt");
        for (let room of rooms) {
            if (room.lastMessage)
                room.lastMessage.content = await crypto.AES.decrypt(
                    room.lastMessage.content,
                    process.env.MESSAGE_SECRET
                ).toString(crypto.enc.Utf8);
        }
        // rooms.forEach((r) => {
        //   r.members = r.members.filter((id) => id !== _id);
        // });
        // console.log(rooms);
        // const settingRooms = rooms.map((r) => {
        //   return r;
        // });
        return res.status(200).json({
            error: false,
            msg: "get rooms successful",
            rooms,
        });
    } catch (error) {
        next(error);
    }
};
exports.updateRoom = async(req, res, next) => {
    try {
        const { name, theme } = req.body;
        const { roomId } = req.params;
        const { _id } = req.user;
        const room = await Room.findOne({ _id: roomId, deleteAt: undefined });
        if (!room) {
            return res.status(200).json({
                error: true,
                message: "Room is not found",
            });
        }
        let check = false;
        for (userIdr of room.members) {
            if (userIdr.toString() == _id.toString()) check = true;
        }
        if (!check) {
            return res.status(200).json({
                error: true,
                message: "How dare you",
            });
        }
        const newRoom = await Room.findOneAndUpdate({ _id: roomId, deleteAt: undefined }, { name, theme }, { new: true });
        return res.status(200).json({
            error: false,
            message: "Update room successful",
            newRoom,
        });
    } catch (error) {
        next(error);
    }
};
exports.addMember = async(req, res, next) => {
    try {
        const { roomId } = req.params;
        const { addedId } = req.body;
        const { _id } = req.user;
        const room = await Room.findOne({ _id: roomId, deleteAt: undefined });
        if (!room) {
            return res.status(200).json({
                error: true,
                message: "Room is not found",
            });
        }
        const added = await User.findOne({ _id: addedId, deleteAt: undefined });
        if (!added) {
            return res.status(200).json({
                error: true,
                message: "The Guy added is not found",
            });
        }
        let check = false;
        for (userId of room.members) {
            if (userId == addedId) {
                return res.status(200).json({
                    error: true,
                    message: "The Guy added have in room ",
                });
            }
            if (userId.toString() == _id.toString()) check = true;
        }
        if (!check)
            return res.status(200).json({
                error: true,
                message: "Adder not have in room ",
            });
        const newRoom = await Room.findOneAndUpdate({ _id: roomId }, { $push: { members: addedId } }, { new: true });
        return res.status(200).json({
            error: false,
            message: "Add new member successful",
            newRoom,
        });
    } catch (error) {
        next(error);
    }
};
exports.kickMember = async(req, res, next) => {
    try {
        const { roomId } = req.params;
        const { _id } = req.user;
        const { kickedId } = req.body;
        const room = await Room.findOne({ _id: roomId, deleteAt: undefined });
        if (!room) {
            return res.status(200).json({
                error: true,
                message: "Room is not found",
            });
        }
        let check = false;
        for (userId of room.members) {
            if (userId == kickedId) check = true;
        }
        if (!check) {
            return res.status(200).json({
                error: true,
                message: "The Guy kicked not have in room",
            });
        }
        if (_id.toString() != room.host.toString()) {
            return res.status(200).json({
                error: true,
                message: "You are not host",
            });
        }
        if (_id == kickedId) {
            return res.status(200).json({
                error: true,
                message: "You can`t kick yourself",
            });
        }
        const newRoom = await Room.findOneAndUpdate({ _id: roomId }, { $pull: { members: kickedId } }, { new: true });
        return res.status(200).json({
            error: false,
            message: "Kick members successful",
            newRoom,
        });
    } catch (error) {
        next(error);
    }
};
exports.outRoom = async(req, res, next) => {
    try {
        const { roomId } = req.params;
        const { _id } = req.user;
        const room = await Room.findOne({ _id: roomId, deleteAt: undefined });
        if (!room) {
            return res.status(200).json({
                error: true,
                message: "Room is not found",
            });
        }
        let check = false;
        for (userId of room.members) {
            if (userId.toString() == _id.toString()) {
                check = true;
            }
        }
        if (!check) {
            return res.status(200).json({
                error: true,
                message: "You not have in room",
            });
        }
        const roomParam = {
            host: room.host,
            members: room.members.filter((mem) => mem.toString() != _id.toString()),
        };
        if (_id.toString() == room.host.toString()) {
            roomParam.host = roomParam.members[0];
        }
        const newRoom = await Room.findOneAndUpdate({ _id: roomId }, roomParam, {
            new: true,
        });
        return res.status(200).json({
            error: false,
            message: "Out room successful",
            newRoom,
        });
    } catch (error) {
        next(error);
    }
};
exports.createRoom = async(req, res, next) => {
    try {
        const { _id } = req.user;
        const { name, members, theme } = req.body;
        if (members.length == 0) {
            return res.status(200).json({
                error: true,
                message: "Members is requied",
            });
        }
        const newMembers = [...members, _id];
        const room = await new Room({
            name,
            members: newMembers,
            theme,
            host: _id,
        });
        await room.save();
        const newRoom = await Room.findById(room._id).populate({
            path: "members",
            select: "name _id email status",
        });
        return res.status(200).json({
            error: false,
            message: "Create Room successful",
            room: newRoom,
        });
    } catch (error) {
        next(error);
    }
};
exports.getImageInRoom = async(req, res, next) => {
    try {
        const { roomId } = req.params;
        console.log(roomId);
        if (!roomId) return res.status(200).json({
            error: true,
            message: "Room Id is required"
        })
        const messages = await Message.find({ to: roomId, type: { $in: ['1', '2'] } })
        return res.status(200).json({
            error: false,
            message: "Get image and video successful",
            messages
        })
    } catch (error) {
        next(error)
    }
}