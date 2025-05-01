const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Correct path according to your project

// GET all users
router.get('/adminboard', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.render('adminboard', { users }); // Render with user data
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
