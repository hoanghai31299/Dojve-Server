const route = require("express").Router();

const stickerController = require("../controllers/sticker.controller");
const authenticate = require("../controllers/auth.controller");

route.use(authenticate.isSignIn);

route.get("/getTrendingPack", stickerController.getPacks);
route.get("/getSticker/:packId", stickerController.getStickers);
route.get("/search", stickerController.searchSticker);

module.exports = route;
