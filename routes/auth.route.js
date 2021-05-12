const {
    signin,
    signup,
    signout,
    verifyEmail,
    signinByCookie,
    authGoogle,
    authGoogleCallBack,
} = require("../controllers/auth.controller");
const authController = require("../controllers/auth.controller");

const express = require("express");
const route = express.Router();

route.post("/signup", signup);
route.post("/signin", signin);
route.get("/verify/:token", verifyEmail);
route.get("/signout", authController.isSignIn, signout);
route.get("/signinW", signinByCookie);
route.get("/signin/google", authGoogle);
route.get("/google/callback", authGoogleCallBack);

module.exports = route;