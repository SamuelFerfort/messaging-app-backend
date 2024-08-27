const express = require("express")
const verifyToken = require("../middleware/verifyToken")
const controller = require("../controllers/messagesController")
const router = express.Router()


router.use(verifyToken)



module.exports = router