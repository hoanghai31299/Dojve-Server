const route = require("express").Router();

const videoController = require("../controllers/videocall.controller");
const authenticate = require("../controllers/auth.controller");

// route.use(authenticate.isSignIn);

route.get("/getToken", authenticate.isSignIn, videoController.getAccessToken);
route.get("/joinRoom", authenticate.isSignIn, videoController.joinARoom);
module.exports = route;
