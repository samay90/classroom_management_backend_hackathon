const express = require("express")
const authRouter = require("../controllers/Auth")
const router = express.Router()

router.use("/auth",authRouter)

module.exports = router