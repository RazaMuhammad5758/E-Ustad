const {Router} = require("express")
const Blog = require("../models/blog")
const multer = require("multer")
const path = require("path")
const Comment = require("../models/comments")

const router = Router()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads`))
    },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
})

const upload = multer({ storage: storage });

router.get("/add-new", (req, res)=>{
    return res.render("addBlogs", {
        user: req.user
    })
})

router.get("/:id", async (req, res)=>{
    try {
        const blog = await Blog.findById(req.params.id).populate("createdBy", "fullName profileImageUrl");
        const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy", "fullName profileImageUrl");

        return res.render('blog', {
            user: req.user,
            blog,
            comments,
        });
    } catch (error) {
        console.error("Error loading blog page:", error);
        res.status(500).send("Error loading blog.");
    }
});

router.post("/comment/:blogId", async (req, res)=>{
    try {
        await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,
        });
        return res.redirect(`/blog/${req.params.blogId}`);
    } catch (error) {
        console.error("Error posting comment:", error);
        res.status(500).send("Error posting comment.");
    }
});

router.post("/", upload.array("coverImages", 5), async (req, res) => {
    const { title, body, category } = req.body;

    if (!category) {
        return res.status(400).send("Category is required");
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    try {
        const blog = await Blog.create({
            title,
            body,
            category,
            createdBy: req.user._id,
            coverImageURL: imageUrls
        });

        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error("Error creating blog:", error);
        return res.status(500).send("Something went wrong");
    }
});

module.exports = router;