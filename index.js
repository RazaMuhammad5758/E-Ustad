const express = require("express")
const path = require("path")
const PORT = 7000
const app = express()
const userRoutes = require('./routes/user')
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const { checkForAuthenticationCookie } = require("./middlewares/authentication")

app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
app.use(express.urlencoded({extended: false}))
// app.use(express.json());

mongoose.connect('mongodb://localhost:27017/blogify').then((e)=>{console.log("Mongodb connected")})

app.get("/", (req, res)=>{
    res.render("home",{
        user: req.user,

    })
})
app.use("/user", userRoutes)

app.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`)
})