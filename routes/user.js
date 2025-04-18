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
    const allBlogs = await Blog.find({});
    res.render("professionals", {
      user: req.user || null,
      blogs: allBlogs
    });
  } catch (err) {
    console.error("Error in /professionals route:", err.message);
    res.render("professionals", {
      user: null,
      blogs: []
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

router.post("/signup", upload.single('profileImage'), async (req, res) => {
  const { fullName, email, password, address, userRole } = req.body;
  const profileImageUrl = req.file ? `/uploads/${req.file.filename}` : '/images/profile.jpg';

  await User.create({
    fullName,
    email,
    password,
    phone,
    address,
    userRole,
    profileImageUrl
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
