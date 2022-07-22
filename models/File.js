//File database object
const mongoose = require("mongoose")

const File = new mongoose.Schema({
    path: {
        type: String,
        require: true
    },
    originalName: {
        type: String,
        require: true
    },
    password : String, //not required
    downloadCount : {
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = mongoose.model("File", File) //Create table "File" with schema File
