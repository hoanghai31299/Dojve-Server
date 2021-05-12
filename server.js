//import
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const cookieSession = require("cookie-session");
const socketIO = require("socket.io");
const http = require("http");
require("dotenv").config();
require("./helpers/passport.setup");
const { connectDB } = require("./models");

connectDB();

const app = SetupExpress();

function SetupExpress() {
  const app = express();
  const server = http.Server(app);
  const io = socketIO(server, {
    cors: {
      origin: "https://dojve.vercel.app",
      credentials: true,
    },
  });
  require("./socket/message")(io);
  require("./socket/friend")(io);
  require("./socket/call")(io);
  const port = process.env.PORT || 5000;
  server.listen(port, function () {
    console.log(`Listening on port ${port}`);
  });
  ConfigureExpress(app);

  //setup router here bro
  app.get("/", (req, res, next) => {
    return res.send("Heroku tai tro chuong trinh nay");
  });
  app.use("/auth", require("./routes/auth.route"));
  app.use("/message", require("./routes/message.route"));
  app.use("/user", require("./routes/user.route"));
  app.use("/rooms", require("./routes/room.route"));
  app.use("/call", require("./routes/videocall.route"));
  app.use("/sticker", require("./routes/sticker.route"));
  //error handler
  app.use((err, req, res, next) => {
    if (err) {
      console.log(err);
      return res.status(200).json({
        error: true,
        message: err.message,
      });
    }
  });

  //Wrong URL handler
  app.use((req, res, next) => {
    return res.json({
      error: true,
      message: "404 not found, check your URL",
    });
  });
}

function ConfigureExpress(app) {
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
      limit: process.env.CLIENT_MAX_BODY_SIZE,
      parameterLimit: 10000,
    })
  );

  app.use(cookieParser());
  const headers = {
    origin: "https://dojve.vercel.app",
    // credentials: true,
    // method: "GET,POST,PUT,PATCH,DELETE,HEAD",
  };
  app.use(cors(headers));
  app.use(
    cookieSession({
      name: "session",
      keys: ["key1", "key2"],
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
}
