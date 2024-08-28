const express = require("express")

const controller = require("../controllers/authController")
const router = express.Router()




router.post("/login", controller.loginPost)


router.post("/register", controller.registerPost)





module.exports = router