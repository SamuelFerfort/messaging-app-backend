const { PrismaClient } = require("@prisma/client");
const formatChat = require("../helpers/formatChat");

const prisma = new PrismaClient();

exports.getChatsForUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        messages: {
          orderBy: {
            timestamp: "desc",
          },
          select: {
            id: true,
            content: true,
            timestamp: true,
            senderId: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    const formattedChats = chats.map((chat) => formatChat(chat, userId));

    res.json(formattedChats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.user.id },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
      },
      orderBy: {
        firstName: "asc",
      },
    });

    res.json(users);
  } catch (err) {
    console.error("Error getting all users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.startChat = async (req, res) => {
  try {
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          { users: { some: { id: req.user.id } } },
          { users: { some: { id: req.body.otherUserId } } },
        ],
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            about: true,
            createdAt: true,
            updatedAt: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        messages: {
          orderBy: { timestamp: "desc" },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    console.log("Existing chat:", existingChat);
    if (existingChat) {
      return res.json(formatChat(existingChat, req.user.id));
    }

    // If no existing chat, create a new one
    const newChat = await prisma.chat.create({
      data: {
        isGroup: false,
        users: {
          connect: [{ id: req.user.id }, { id: req.body.otherUserId }],
        },
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            about: true,
            createdAt: true,
            updatedAt: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        messages: true,
      },
    });

    console.log("New Chat", newChat);
    res.json(formatChat(chat, req.user.id));
  } catch (err) {
    console.error("Error creating new chat:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.sendMessage = async (req, res) => {
  const { content, receiverId } = req.body;
  const chatId = req.params.chatId;
  const senderId = req.user.id;

  try {
    const message = await prisma.message.create({
      data: {
        content,
        read: false,
        chat: {
          connect: { id: chatId },
        },
        sender: {
          connect: { id: senderId },
        },
        receiver: {
          connect: { id: receiverId },
        },
      },
      include: {
        sender: true,
        receiver: true,
        chat: true,
      },
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
    });

    res.json(messages);
  } catch (err) {
    console.error("Error getting messages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  // Logic to delete a specific message
};
