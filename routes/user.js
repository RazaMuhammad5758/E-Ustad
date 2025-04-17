const { Router } = require("express");
const User = require("../models/user");
const { createTokenForUser } = require("../services/authentication");

const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signIn", { currentRoute: 'signin', user: req.user });
});

router.get("/signup", (req, res) => {
  return res.render("signUp", { currentRoute: 'signup', user: req.user });
});
router.get("/professionals", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("professionals", {
      user: req.user || null, // fallback to null to avoid error
      blogs: allBlogs,
  });
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

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  await User.create({
    fullName,
    email,
    password
  });
  return res.redirect("/");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;
