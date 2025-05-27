require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const adminRoutes = require("./routes/admin");
const Blog = require("./models/blog");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static("public"));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URL).then(() => console.log("MongoDB connected"));

const PORT = process.env.PORT || 7000;

app.use("/admin", adminRoutes);
app.use("/user", userRoutes); // ✅ ensure it's used before any /user route
app.use("/blog", blogRoutes);

app.get("/", async (req, res) => {
  const blogs = await Blog.find().limit(4);
  res.render("home", { blogs });
});

app.get("/professionals", async (req, res) => {
  try {
    const blogs = req.query.category
      ? await Blog.find({ category: req.query.category }).populate("createdBy", "fullName profileImageUrl")
      : await Blog.find().populate("createdBy", "fullName profileImageUrl");
    res.render("professionals", { user: req.user, blogs });
  } catch (err) {
    console.error("Error in /professionals:", err.message);
    res.render("professionals", { user: req.user, blogs: [] });
  }
});

app.get("/user/profile", (req, res) => {
  const user = req.user || res.locals.user;
  if (!user) return res.redirect("/user/signin");
  res.render("user/profile", { user });
});

app.get("/user/my-blogs", async (req, res) => {
  try {
    const user = req.user || res.locals.user;
    if (!user) return res.redirect("/user/signin");
    const blogs = await Blog.find({ createdBy: user._id });
    res.render("user/myBlogs", { user, blogs });
  } catch (err) {
    console.error("Error loading user blogs:", err);
    res.status(500).send("Failed to load blogs.");
  }
});

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
