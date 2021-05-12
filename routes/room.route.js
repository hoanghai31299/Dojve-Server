const route = require("express").Router();

const roomController = require("../controllers/room.controller");
const authenticate = require("../controllers/auth.controller");

route.use(authenticate.isSignIn);

route.get("/", roomController.getAllRooms);
route.put("/outRoom/:roomId", roomController.outRoom);
route.put("/kickMember/:roomId", roomController.kickMember);
route.put("/addMember/:roomId", roomController.addMember);
route.put("/update/:roomId", roomController.updateRoom);
route.post("/", roomController.createRoom);
module.exports = route;
