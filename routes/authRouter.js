const express = require("express")

const controller = require("../controllers/authController")
const router = express.Router()


router.get("/login", controller.loginGet)
router.post("/login", controller.loginPost)


router.get("/register", controller.registerGet)
router.post("/register", controller.registerPost)





export default router