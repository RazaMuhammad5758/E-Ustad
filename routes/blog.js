const {Router} = require("express")
const multer = require("multer")
const path = require("path")

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

router.post("/", upload.single("coverImage"), (req, res)=>{
    console.log(req.body)
    console.log(req.file)
    return res.redirect("/")
})



module.exports = router