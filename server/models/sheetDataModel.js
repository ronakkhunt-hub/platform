const mongoose = require("mongoose");

const sheetSchema = new mongoose.Schema({
    name: {
        type: String
    },
    age: {
        type: Number
    },
    phoneno: {
        type: Number
    }
});


module.exports = mongoose.model('sheetData', sheetSchema);