const express = require("express")
const verifyToken = require("../middleware/verifyToken")
const controller = require("../controllers/messagesController")
const router = express.Router()



router.use(verifyToken)

router.get("/chats", controller.getChatsForUser)
router.get("/users", controller.getUsers)
router.post("/chats/create", controller.startChat)
router.post("/chats/:chatId/messages/create", controller.sendMessage)
router.get("/chats/:chatId/messages", controller.getMessages)


module.exports = router