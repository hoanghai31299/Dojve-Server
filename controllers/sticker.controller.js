const request = require("request");

module.exports.getPacks = (req, res, next) => {
  const _id = req.user._id;
  const limit = +req.query.limit || 15;
  const page = req.query.page || 1;
  request(
    {
      headers: {
        apiKey: process.env.STICKER_API_KEY,
      },
      uri: `https://messenger.stipop.io/v1/package?userId=${_id}&limit=${limit}&animated=Y`,
    },
    (err, r, body) => {
      if (err) return next(err);
      res.status(200).json(JSON.parse(body));
    }
  );
};

module.exports.getStickers = (req, res, next) => {
  const _id = req.user._id;
  const { packId } = req.params;
  request(
    {
      headers: {
        apiKey: process.env.STICKER_API_KEY,
      },
      uri: `https://messenger.stipop.io/v1/package/${packId}?userId=${_id}`,
    },
    (err, r, body) => {
      if (err) return next(err);
      res.status(200).json(JSON.parse(body));
    }
  );
};

module.exports.searchSticker = (req, res, next) => {
  const _id = req.user._id;
  const q = req.query.q;
  const limit = +req.query.limit || 18;
  console.log("call");
  request(
    {
      headers: {
        apiKey: process.env.STICKER_API_KEY,
      },
      uri: `https://messenger.stipop.io/v1/search?userId=${_id}&limit=${limit}&q=${q}`,
    },
    (err, r, body) => {
      if (err) return next(err);
      res.status(200).json(JSON.parse(body));
    }
  );
};
