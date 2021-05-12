const route = require("express").Router();

const userController = require("../controllers/user.controller");
const authenticate = require("../controllers/auth.controller");

route.use(authenticate.isSignIn);

route.get("/sendRequest/:to", userController.newRequest);
route.get("/acceptRequest/:to", userController.acceptRequest);
route.get("/declineRequest/:to", userController.declineRequest);
route.get("/getListFriend", userController.getListFriend);
route.get("/getListFriendRequest", userController.getListFriendRequest);
route.get("/:_id", userController.getUser);
route.get("/", userController.getAllUser);
route.put("/:_id", userController.updateUser);
route.post("/search", userController.searchEmailUsers);

module.exports = route;