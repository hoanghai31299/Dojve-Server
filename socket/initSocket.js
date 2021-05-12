const jwt = require("jsonwebtoken");
module.exports = function (socket, next) {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      process.env.JWT_TOKEN_SECRET,
      function (err, decoded) {
        if (err) return next(new Error("Authentication error"));
        let _id = decoded.user._id;
        console.log(_id);
        User.find(_id)
          .populate("friends")
          .exec((err, user) => {
            socket.user = user;
            next();
          });
      }
    );
  } else {
    next(new Error("Authentication error"));
  }
};
