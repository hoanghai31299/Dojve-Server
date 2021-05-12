const mongoose = require("mongoose");
const URI = process.env.MONGO_URI;
module.exports = {
    mongoose,
    connectDB: () => {
        return mongoose
            .connect(URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false,
            })
            .then(() => {
                console.log("Database is connected");
            })
            .catch((err) => {
                console.log(err);
            });
    },
};