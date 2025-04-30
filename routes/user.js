const { Router } = require("express");
const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");
const upload = require("../middlewares/upload");  // Ensure this middleware exists
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
      blogs = await Blog.find({ category });
    } else {
      blogs = await Blog.find();
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

// Admin Login Bypass (special case for admin login)
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  // Step 1: Admin bypass check
  if (email === "admin@gmail.com" && password === "admin") {
    return res.redirect("/adminboard");
  }

  try {
    // Step 2: Normal user authentication
    const token = await User.matchPasswordAndGenerateToken(email, password);
    const user = await User.findOne({ email });

    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email
    };

    // Store user data in locals and cookie
    res.locals.user = userData;
    return res.cookie("token", token).redirect("/");

  } catch (error) {
    return res.render("signIn", {
      error: "Incorrect email or password"
    });
  }
});

// Adminboard Route - Show all users
router.get("/adminboard", async (req, res) => {
  try {
    const allUsers = await User.find();  // Get all users from DB
    res.render("adminboard", { users: allUsers });
  } catch (error) {
    console.error("Error loading adminboard:", error);
    res.status(500).send("Server Error");
  }
});

// User Signup Route
router.post("/signup", upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'cnicImage', maxCount: 1 }
]), async (req, res) => {
  const { fullName, email, password, phone, address, role, profession, experience } = req.body;

  // Normalize role and handle file upload for images
  const normalizedRole = role.toUpperCase();
  
  const profileImageUrl = req.files['profileImage']
    ? `/uploads/${req.files['profileImage'][0].filename}`
    : '/images/profile.jpg';

  const cnicImageUrl = req.files['cnicImage']
    ? `/uploads/${req.files['cnicImage'][0].filename}`
    : '';

  // Create new user in DB
  await User.create({
    fullName,
    email,
    password,
    phone,
    address,
    profileImageUrl,
    userRole: normalizedRole,
    profession: normalizedRole === 'PROFESSIONAL' ? profession : undefined,
    cnicImage: normalizedRole === 'PROFESSIONAL' ? cnicImageUrl : undefined,
    experience: normalizedRole === 'PROFESSIONAL' ? experience : undefined
  });

  return res.redirect("/");
});

// Logout Route
router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

// Profile Page Route
router.get('/profile', (req, res) => {
  const user = req.session.user || req.user || res.locals.user;

  if (!user) {
    return res.redirect('/user/signin');
  }

  res.render('user/profile', { user });
});

module.exports = router;
