const express = require("express")
const authRouter = require("../controllers/Auth")
const userVerifier = require("../helpers/middleware/userVerifier")
const userRouter = require("../controllers/User")
const classRouter = require("../controllers/Classroom")
const router = express.Router()

router.use("/auth",authRouter)
router.use("/user",userVerifier,userRouter)
router.use("/classroom",userVerifier,classRouter)
module.exports = router