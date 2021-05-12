const { mongoose } = require(".");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "email user is required"],
    lowercase: true,
    trim: true,
    unique: [true, "email is unique"],
    match: [/\S+@\S+\.\S+/, "is invalid"],
    index: true,
  },
  status: {
    type: Number,
    enum: [0, 1, 2],
    required: [true, "status is required"],
    default: 0,
  },
  gender: {
    type: Number,
    enum: [0, 1],
  },
  dob: {
    type: Date,
  },
  password: {
    type: String,
    required: [true, " password user is required"],
  },
  deleteAt: {
    type: Date,
    default: undefined,
  },
  friends: {
    type: Array,
    default: [],
  },
  friendRequests: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("User", userSchema, "users");
