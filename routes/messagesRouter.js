const express = require("express")
const verifyToken = require("../middleware/verifyToken")
const controller = require("../controllers/messagesController")
const router = express.Router()


router.use(verifyToken)

router.get("/chats", controller.getChatsForUser)
router.get("/users", controller.getUsers)
router.post("/chats/create",controller.startChat)


module.exports = router