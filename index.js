const express = require("express")
const path = require("path")
const PORT = 7000
const app = express()
const userRoutes = require('./routes/user')
const mongoose = require("mongoose")

app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))

app.use(express.urlencoded({extended: false}))

mongoose.connect('mongodb://localhost:27017/blogify').then(e=>{console.log("Mongodb connected")})

app.get("/", (req, res)=>{
    res.render("home")
})
app.use("/user", userRoutes)

app.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`)
})