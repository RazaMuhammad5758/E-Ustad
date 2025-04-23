const { Router } = require("express");
const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");
const upload = require("../middlewares/upload"); // add this line at the top


const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signIn", { currentRoute: 'signin', user: req.user });
});

router.get("/signup", (req, res) => {
  return res.render("signUp", { currentRoute: 'signup', user: req.user });
});
router.get("/professionals", async (req, res) => {
  try {
    const { category } = req.query; // Get category from query parameters
    let blogs;

    // If category is provided, filter the blogs by category, otherwise, fetch all
    if (category) {
      blogs = await Blog.find({ category }); // Assuming Blog has a `category` field
    } else {
      blogs = await Blog.find(); // Fetch all blogs if no category is provided
    }

    res.render("professionals", {
      user: req.user || null,
      blogs: blogs
    });
  } catch (err) {
    console.error("Error in /professionals route:", err.message);
    res.render("professionals", {
      user: null,
      blogs: [] // In case of error, send an empty list of blogs
    });
  }
});




router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    const user = await User.findOne({ email }); // Fetch user data for locals
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email
    };

    // Store user data in locals and cookie
    res.locals.user = userData;
    return res.cookie("token", token).redirect("/");

  } catch (error) {
    return res.render("signin", {
      error: "Incorrect email or password"
    });
  }
});

router.post("/signup", upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'cnicImage', maxCount: 1 }
]), async (req, res) => {
  const { fullName, email, password, phone, address, role, profession, experience } = req.body;

  const profileImageUrl = req.files['profileImage'] 
    ? `/uploads/${req.files['profileImage'][0].filename}`
    : '/images/profile.jpg';

  const cnicImageUrl = req.files['cnicImage']
    ? `/uploads/${req.files['cnicImage'][0].filename}`
    : '';

  await User.create({
    fullName,
    email,
    password,
    phone,
    address,
    profileImageUrl,
    userRole: role.toUpperCase(),  // Fix here, instead of 'role', 'userRole' should be used.
    profession: role === 'professional' ? profession : undefined,
    cnicImage: role === 'professional' ? cnicImageUrl : undefined,
    experience: role === 'professional' ? experience : undefined
  });

  return res.redirect("/");
});


router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});
router.get('/profile', (req, res) => {
  const user = req.session.user || req.user || res.locals.user;

  if (!user) {
    return res.redirect('/user/signin');
  }

  res.render('user/profile', { user });
});


module.exports = router;
