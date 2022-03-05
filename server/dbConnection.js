const mongoose = require("mongoose");

function connection() {
    mongoose.connect("mongodb://localhost:27017/sheet-project").then(() => {
        console.log("Database connected successfully");
    }).catch((err) => {
        console.error(err);
    })
}

module.exports = connection;