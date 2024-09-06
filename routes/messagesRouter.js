const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

router.use(verifyToken);

module.exports = function (io) {
  const controller = require("../controllers/messagesController")(io);

  router.get("/chats", controller.getChatsForUser);
  router.get("/users", controller.getUsers);
  router.post("/chats/group", controller.startGroup);

  router.post("/chats/create", controller.startChat);
  router.post("/chats/:chatId/messages/create", controller.sendMessage);
  router.get("/chats/:chatId/messages", controller.getMessages);


  return router;
};
