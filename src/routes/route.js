const express = require("express")
const authRouter = require("../controllers/Auth")
const userVerifier = require("../helpers/middleware/userVerifier")
const userRouter = require("../controllers/User")
const classRouter = require("../controllers/Classroom")
const router = express.Router()

const delay = (req,res,next) =>{
    setTimeout(()=>{
        next()
    },[1000])
}

router.use("/auth",delay,authRouter)
router.use("/user",delay,userVerifier,userRouter)
router.use("/classroom",delay,userVerifier,classRouter)
module.exports = router