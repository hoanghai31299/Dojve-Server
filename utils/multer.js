const multer = require("multer");

//save file to memory first to process with cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb({ message: "Upsupported File Format" }, false);
    }
};

const uploads = multer({
    storage,
    limits: { fileSize: 2048 * 2048 },
    //fileFilter,
});

module.exports = { uploads };