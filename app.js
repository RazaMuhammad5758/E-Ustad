require("dotenv").config()
const express = require("express")
const path = require("path")
const app = express()
const userRoutes = require('./routes/user')
const blogRoutes = require('./routes/blog')
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const { checkForAuthenticationCookie } = require("./middlewares/authentication")
const Blog = require("./models/blog")
const adminRoutes = require('./routes/admin'); // path adjust karein
app.use(adminRoutes);

app.use('/admin', adminRoutes);


app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
// app.use(express.static(path.resolve("./public")));
app.use(express.static("public"));
const PORT = process.env.PORt || 7000
// app.use(express.json());

mongoose.connect(process.env.MONGO_URL).then((e)=>{console.log("Mongodb connected")})

app.use((req, res, next) => {
  // This will set the error in locals for all views
  res.locals.error = req.error || null;
  next();
});
app.get("/someRoute", (req, res) => {
  res.render("home", { error: "Some error message" });
});
// Example route in app.js or routes file
app.get('/', async (req, res) => {
    try {
      const blogs = await Blog.find().limit(4);
      res.render('home', { blogs });
    } catch (err) {
      console.error(err);
      res.render('home', { blogs: [] }); 
    }
  });
  
  app.get("/professionals", async (req, res) => {
    const { category } = req.query; // Get category from query parameters
    let blogs;

    try {
        // If category is provided, filter the blogs by category, otherwise, fetch all
        if (category) {
            blogs = await Blog.find({ category }); // Assuming Blog has a `category` field
        } else {
            blogs = await Blog.find(); // Fetch all blogs if no category is provided
        }

        res.render("professionals", {
            user: req.user,
            blogs: blogs
        });
    } catch (err) {
        console.error("Error in /professionals route:", err.message);
        res.render("professionals", {
            user: req.user,
            blogs: [] // In case of error, send an empty list of blogs
        });
    }
});

app.get('/user/profile', (req, res) => {
    const user = req.user;

    if (!user) {
      return res.redirect('/user/signin');
    }

    res.render('user/profile', { user });
});


app.use("/user", userRoutes)
app.use("/blog", blogRoutes)
// app.use((req, res, next) => {
//     res.locals.user = req.session.user || null;
//     res.locals.error = req.session.error || null;
//     next();
//   });
  
app.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`)
})