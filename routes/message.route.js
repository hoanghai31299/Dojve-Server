const route = require("express").Router();

const messageController = require("../controllers/message.controller");
const authenticate = require("../controllers/auth.controller");
const { uploads } = require("../utils/multer");
route.use(authenticate.isSignIn);

route.post("/newMessage", messageController.createMessage);
route.get("/getMessageRoom/:roomId", messageController.getMessageRoom);
route.get("/getMessages/:roomId", messageController.getMessageRoomGroup);
route.post("/upImage", uploads.single("image"), messageController.upImage);
route.post("/upVideo", uploads.single("image"), messageController.upVideo);
route.post("/upFile", uploads.single("image"), messageController.upImage);

module.exports = route;