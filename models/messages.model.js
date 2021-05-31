const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const messageSchema = new Schema({
    type: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6], //0 - text, 1 - image, 2 - video, 3 - sticker, 4 - gif, 5 - invite a call, 6 - file
        required: [true, "type message is required"],
    },
    content: {
        type: String,
        required: [true, "content message is required"],
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "serder message is required"],
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: [true, "receiver is required"],
    },
    deleteAt: {
        type: Date,
        default: undefined,
    },
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema, "messages");