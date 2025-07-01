const express = require('express');
const router = express.Router();
const User = require('../models/user');

const Blog = require('../models/blog'); // ✅ Required

router.get('/adminboard', async (req, res) => {
  try {
    const users = await User.find();

    // ✅ Use "role" instead of "userRole"
    const userCounts = await User.aggregate([
      { $match: { role: "PROFESSIONAL" } },
      { $group: { _id: "$profession", count: { $sum: 1 } } }
    ]);

    const blogCounts = await Blog.aggregate([
      { $group: { _id: "$profession", count: { $sum: 1 } } }
    ]);

    const allProfessions = new Set([
      ...userCounts.map(u => u._id),
      ...blogCounts.map(b => b._id)
    ]);

    const professionStats = [];

    allProfessions.forEach(prof => {
      const userEntry = userCounts.find(u => u._id === prof);
      const blogEntry = blogCounts.find(b => b._id === prof);

      professionStats.push({
        profession: prof,
        users: userEntry?.count || 0,
        blogs: blogEntry?.count || 0
      });
    });

    res.render('adminboard', { users, professionStats });

  } catch (error) {
    console.error("Adminboard error:", error);
    res.status(500).send("Server Error");
  }
});




// GET user profile (for admin)
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('profile', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// DELETE user by ID
// DELETE user by ID
router.post('/delete/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });  // ✅ Don't use res.redirect here
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error deleting user" });
  }
});


module.exports = router;
