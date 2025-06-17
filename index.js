const express = require("express")
const app = express()
const cors = require("cors")
const expressFileUpload = require("express-fileupload")
const bodyParser = require("body-parser")
const router = require("./src/routes/route")

app.use(expressFileUpload({
    createParentPath:true
}))
app.use(express.static(__dirname+"/public"))
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors({origin:"*"}))
app.use("/",router)
app.get("/",(req,res)=>{
    res.send("<h1>Welcome to CMS</h1>")
})
app.listen(9920,"192.168.0.106")

// Home: 192.168.0.107
// My Mobile : 192.168.150.135
// IIT GOA : 10.196.37.139