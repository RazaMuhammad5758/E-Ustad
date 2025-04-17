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


router.post("/",  upload.array("coverImages", 5), async (req, res)=>{
    const {title, body} = req.body;
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURLs: imageUrls   
    })
    return res.redirect(`/blog/${blog._id}`)
})





module.exports = router