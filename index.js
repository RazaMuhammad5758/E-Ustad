const express = require("express")
const path = require("path")
const PORT = 7000
const app = express()

app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))


app.get("/", (req, res)=>{
    res.render("home")
})


app.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`)
})