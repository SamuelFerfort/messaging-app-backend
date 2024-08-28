const { PrismaClient} = require("@prisma/client")

const prisma = new PrismaClient()


exports.getAllMessages = (req, res) => {
    // Logic to fetch all messages for the authenticated user
    // req.user contains the decoded token payload
};

exports.sendMessage = (req, res) => {
    // Logic to send a new message
};

exports.getChatMessages = (req, res) => {
    const { chatId } = req.params;
    // Logic to fetch messages for a specific chat
};

exports.deleteMessage = (req, res) => {
    const { messageId } = req.params;
    // Logic to delete a specific message
};