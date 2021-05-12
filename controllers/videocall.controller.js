const accountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilio = require("twilio");
const client = twilio(accountSid, authToken);
const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const token = new AccessToken(accountSid, twilioApiKey, twilioApiSecret);

module.exports.getAccessToken = (req, res, next) => {
  try {
    const { roomid } = req.query;
    token.identity = req.user.name;
    client.video.rooms.list({ uniqueName: roomid }).then((rooms) => {
      if (rooms.length === 0) {
        client.video.rooms
          .create({ uniqueName: roomid })
          .then((room) => {
            const videoGrant = new VideoGrant({
              room: room.sid,
            });
            // Add the grant to the token
            token.addGrant(videoGrant);
            return res.status(200).json({
              error: false,
              message: "Get accessToken successful",
              token: token.toJwt(),
              roomSID: room.sid,
            });
          })
          .catch((error) => {
            console.log("loi twilio tao phong");
            return res.status(200).json({
              error: true,
              msg: error.msg,
              message: "Get accessToken failed",
            });
          });
      } else {
        try {
          console.log("tim thay phong"), rooms[0].sid;
          const videoGrant = new VideoGrant({
            room: rooms[0].sid,
          });
          // Add the grant to the token
          token.addGrant(videoGrant);
          return res.status(200).json({
            error: false,
            message: "Get accessToken successful",
            token: token.toJwt(),
            roomSID: rooms[0].sid,
          });
        } catch (error) {
          console.log(error);
        }
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
module.exports.joinARoom = (req, res, next) => {
  try {
    console.log("access");
    const { sid } = req.query;
    console.log("access", sid);
    token.identity = req.user.name;
    const videoGrant = new VideoGrant({
      room: sid,
    });
    // Add the grant to the token
    token.addGrant(videoGrant);
    res.status(200).json({
      error: false,
      message: "Get accessToken successful",
      token: token.toJwt(),
    });
  } catch (error) {
    next(error);
  }
};
