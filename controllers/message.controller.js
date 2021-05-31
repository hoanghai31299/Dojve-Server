const Message = require("../models/messages.model");
const Room = require("../models/rooms.model");
const crypto = require("crypto-js");
const {
    uploadSingle,
    uploadSingleVideo,
    dataUri,
} = require("../utils/cloudinary");
const { findById } = require("../models/messages.model");

exports.createMessage = async(req, res, next) => {
    console.log("create new Message");
    try {
        const { message } = req.body;
        message.sender = req.user;
        if (!(message.type != undefined && message.content && message.to)) {
            return res.status(200).json({
                error: true,
                message: " type, content, to message is required",
            });
        }
        let room = await Room.findOne({
            _id: message.to,
            members: req.user,
        });
        if (!room) {
            return next(new Error("NOT_EXIST_GROUP"));
        }
        message.content = crypto.AES.encrypt(
            message.content,
            process.env.MESSAGE_SECRET
        ).toString();
        const newMessage = new Message(message);
        await newMessage.save();
        // update Room last message
        room.lastMessage = newMessage._id;
        await room.save();
        return res.status(200).json({
            error: false,
            msg: "Message sended",
            newMessage,
        });
    } catch (error) {
        next(error);
    }
};

exports.getMessageRoom = async(req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 20;
        const nextExtra = +req.query.extra || 0;
        const { roomId } = req.params;
        const { _id } = req.user;
        const room = await Room.findOne({ _id: roomId, members: _id })
            .populate({
                path: "members",
                select: "-friends -friendRequests -password",
            })
            .lean();
        if (!room) {
            return next(new Error("NOT_EXIST_ROOM"));
        }
        const messages = await Message.find({ to: roomId })
            .populate({
                path: "sender",
                select: "-friends -friendRequests -password",
            })
            .skip((page - 1) * limit + nextExtra)
            .limit(limit)
            .sort("-createdAt")
            .lean();

        for (let message of messages) {
            message.content = await crypto.AES.decrypt(
                message.content,
                process.env.MESSAGE_SECRET
            ).toString(crypto.enc.Utf8);
        }
        Message.countDocuments({ to: roomId }).exec((count_error, count) => {
            if (count_error) next(count_error);
            return res.json({
                info: { total: count, page: page, pageSize: messages.length },
                error: false,
                msg: "get message successful",
                messages: messages.reverse(),
                room,
            });
        });
    } catch (error) {
        next(error);
    }
};
exports.getMessageRoomGroup = async(req, res, next) => {
    try {
        const page = +req.query.page || 1;
        const limit = +req.query.limit || 20;
        const nextExtra = +req.query.extra || 0;
        const { roomId } = req.params;
        const { _id } = req.user;
        const room = await Room.findOne({ _id: roomId, members: _id })
            .populate({
                path: "members",
                select: "-friends -friendRequests -password",
            })
            .lean();
        if (!room) {
            return next(new Error("NOT_EXIST_ROOM"));
        }
        const messages = await Message.find({ to: roomId })
            .populate({
                path: "sender",
                select: "-friends -friendRequests -password",
            })
            .sort("-createdAt")
            .lean();

        for (let message of messages) {
            message.content = await crypto.AES.decrypt(
                message.content,
                process.env.MESSAGE_SECRET
            ).toString(crypto.enc.Utf8);
        }
        const messageGroup = [];
        let newGroup = {
            senderId: "",
            messages: new Array(),
        };
        for (let i = 0; i < messages.length; i++) {
            if (newGroup.messages.length === 0) {
                newGroup.senderId = messages[i].sender._id;
                newGroup.messages.push(messages[i]);
                continue;
            } else if (
                messages[i].sender._id.toString() == newGroup.senderId.toString()
            ) {
                newGroup.messages = [messages[i], ...newGroup.messages];
            } else {
                messageGroup.push(newGroup);
                newGroup = {
                    senderId: messages[i].sender._id,
                    messages: [messages[i]],
                };
            }
        }
        if (newGroup.messages.length > 0) messageGroup.push(newGroup);
        Message.countDocuments({ to: roomId }).exec((count_error, count) => {
            if (count_error) next(count_error);
            return res.json({
                info: { total: count, page: page, pageSize: messages.length },
                error: false,
                msg: "get message successful",
                messages: messageGroup.reverse(),
                room,
            });
        });
    } catch (error) {
        next(error);
    }
};
exports.upImage = async(req, res, next) => {
    try {
        if (!req.file) {
            return res.status(200).json({
                error: true,
                message: "file is required",
                files: req.files,
            });
        }
        const file = dataUri(req.file);
        let imgCloudinary;
        if (file.mimetype === "image/jpeg")
            imgCloudinary = await uploadSingle(file.content);
        else if (file.mimetype === "video/mp4")
            imgCloudinary = await uploadSingleVideo(file.content);
        else imgCloudinary = await uploadSingle(file.content);
        image_url = imgCloudinary.url;
        return res.status(200).json({
            error: false,
            message: "up image successful",
            image_url,
        });
    } catch (error) {
        next(error);
    }
};
exports.upVideo = async(req, res, next) => {
    try {
        if (!req.file) {
            return res.status(200).json({
                error: true,
                message: "file is required",
                files: req.files,
            });
        }
        const file = dataUri(req.file).content;
        let imgCloudinary = await uploadSingleVideo(file);
        image_url = imgCloudinary.url;
        return res.status(200).json({
            error: false,
            message: "up file successful",
            image_url,
        });
    } catch (error) {
        next(error);
    }
};