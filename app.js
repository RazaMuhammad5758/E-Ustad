const express = require("express")
const path = require("path")
const app = express()
const userRoutes = require('./routes/user')
const blogRoutes = require('./routes/blog')
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const { checkForAuthenticationCookie } = require("./middlewares/authentication")
const Blog = require("./models/blog")

app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
app.use(express.urlencoded({extended: false}))
// app.use(express.static(path.resolve("./public")));
app.use(express.static("public"));
const PORT = process.env.PORt || 7000

// app.use(express.json());

mongoose.connect(process.env.MONGO_URL).then((e)=>{console.log("Mongodb connected")})

app.get("/", async (req, res)=>{
    const allBlogs = await Blog.find({});
    res.render("home",{
        user: req.user,
        blogs: allBlogs

    })
})
app.use("/user", userRoutes)
app.use("/blog", blogRoutes)

app.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`)
})