const express = require("express")

const controller = require("../controllers/authController")
const router = express.Router()




router.post("/login", controller.loginPost)


router.post("/register", controller.registerPost)

router.get("/user/:userId", controller.getUser)



module.exports = router