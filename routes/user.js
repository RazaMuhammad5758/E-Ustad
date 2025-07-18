const { Router } = require("express");
const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");
const upload = require("../middlewares/upload");
const Blog = require("../models/blog");

const router = Router();

// Render Sign In Page
router.get("/signin", (req, res) => {
  return res.render("signIn", { currentRoute: 'signin', user: req.user });
});

// Render Sign Up Page
router.get("/signup", (req, res) => {
  return res.render("signUp", { currentRoute: 'signup', user: req.user });
});

// Professionals Route (with category filtering)
router.get("/professionals", async (req, res) => {
  try {
    const { category } = req.query;
    let blogs;

    if (category) {
      blogs = await Blog.find({ category })
        .populate("createdBy", "fullName profileImageUrl");
    } else {
      blogs = await Blog.find()
        .populate("createdBy", "fullName profileImageUrl");
    }

    res.render("professionals", {
      user: req.user || null,
      blogs: blogs
    });
  } catch (err) {
    console.error("Error in /professionals route:", err.message);
    res.render("professionals", {
      user: null,
      blogs: []
    });
  }
});

// Admin Login Bypass Removed - this logic should be handled in a proper admin route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    const user = await User.findOne({ email });

    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };

    res.locals.user = userData;

    if (user.role === "ADMIN") {
      return res.cookie("token", token).redirect("/admin/adminboard");
    }

    return res.cookie("token", token).redirect("/");

  } catch (error) {
    return res.render("signIn", {
      error: "Incorrect email or password"
    });
  }
});

// Removed /adminboard from here — now handled in routes/admin.js

// User Signup Route
router.post("/signup", upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'cnicImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      address,
      role,
      profession,
      experience
    } = req.body;

    const normalizedRole = role.toUpperCase();

    const profileImageUrl = req.files['profileImage']
      ? `/uploads/${req.files['profileImage'][0].filename}`
      : '/images/profile.jpg';

    const cnicImageUrl = req.files['cnicImage']
      ? `/uploads/${req.files['cnicImage'][0].filename}`
      : '';

    const newUser = {
      fullName,
      email,
      password,
      phone,
      address,
      role: normalizedRole,
      profileImageUrl
    };

    if (normalizedRole === 'PROFESSIONAL') {
      newUser.profession = profession;
      newUser.cnicImage = cnicImageUrl;
      newUser.experience = experience;
    }

    await User.create(newUser);

    return res.redirect("/");
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).send("Error signing up. Please try again.");
  }
});

// admin
// Redirect old /user/adminboard to new /admin/adminboard
router.get('/adminboard', (req, res) => {
  return res.redirect('/admin/adminboard');
});


// Logout Route
router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

// Profile Page Route
router.get('/profile', async (req, res) => {
  const user = req.user || res.locals.user;
  if (!user) return res.redirect('/user/signin');

  try {
    const blogs = await Blog.find({ createdBy: user._id });
    res.render('user/profile', { user, blogs });
  } catch (err) {
    console.error("Error loading profile blogs:", err);
    res.render('user/profile', { user, blogs: [] });
  }
});

module.exports = router;
