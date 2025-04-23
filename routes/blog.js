const {Router} = require("express")
const Blog = require("../models/blog")
const multer = require("multer")
const path = require("path")
const { findById } = require("../models/user")
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



router.get("/add-new", (req, res)=>{
    return res.render("addBlogs", {
        user: req.user
    })
})

const upload = multer({ storage: storage })

router.get("/:id", async (req, res)=>{
    const blog = await  Blog.findById(req.params.id).populate("createdBy")
    const comments = await  Comment.find({blogId: req.params.id}).populate("createdBy")
    console.log("Comment", comments)
    return res.render('blog',{
        user: req.user,
        blog,
        comments,
        
    })
})

router.post("/comment/:blogId", async (req, res)=>{
     await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`)
})


router.post("/", upload.array("coverImages", 5), async (req, res) => {
    const { title, body, category } = req.body;  // Extract category, title, and body from form data

    // Check if category is provided
    if (!category) {
        return res.status(400).send("Category is required");  // If no category is provided, send error response
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    try {
        const blog = await Blog.create({
            title,
            body,
            category,  // Store the category
            createdBy: req.user._id,
            coverImageURL: imageUrls
        });
        
        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error("Error creating blog:", error);
        return res.status(500).send("Something went wrong");
    }
});






module.exports = router