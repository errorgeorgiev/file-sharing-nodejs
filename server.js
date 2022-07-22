require("dotenv").config()
const multer = require("multer")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const File = require("./models/File")

const express = require("express")
const app = express()
app.use(express.urlencoded({ extended: true }))


//initializing all the files to go to 'uploads' folder --- upload = middleware function
const upload = multer({ dest: "uploads"})

mongoose.connect(process.env.DATABASE_URL)

app.set("view engine", "ejs") //engine

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/upload", upload.single("file"),  async (req, res) => {
    const fileData = {
        path: req.file.path,
        originalName: req.file.originalname
    }
    if (req.body.password !== null && req.body.password !== "") {
        //this is very slow function so we need to await it
        fileData.password = await bcrypt.hash(req.body.password, 10) //salt = 10
    }

    const file = await File.create(fileData)
    res.render("index", { fileLink : `${req.headers.origin}/file/${file.id}` })

})

app.route("/file/id").get(handleDownload).post(handleDownload )

app.get("/file/:id", handleDownload)
app.post("/file/:id", handleDownload)

async function handleDownload(req, res) {
    const file = await File.findById(req.params.id) //find file from db with id

    if (file.password != null) {
        if (req.body.password == null) {
            res.render("password")
            return
        }

        if (!await bcrypt.compare(req.body.password, file.password)) {
            res.render("password", { error: true})
            return
        }
    }


    file.downloadCount++
    await file.save()

    res.download(file.path, file.originalName)
}

app.listen(process.env.PORT)