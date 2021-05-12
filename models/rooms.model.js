const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    members: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      required: [true, "members rooom is required"],
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    theme: {
      type: String,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deleteAt: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rooms", roomSchema, "rooms");
