const { PrismaClient } = require("@prisma/client");

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
          },
        },
        messages: {
          orderBy: {
            timestamp: "desc",
          },
          take: 1,
          select: {
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

    const formattedChats = chats.map((chat) => ({
      id: chat.id,
      name:
        chat.name ||
        (chat.users.length === 2
          ? chat.users.find((u) => u.id !== userId)?.firstName +
            " " +
            chat.users.find((u) => u.id !== userId)?.lastName
          : "Group Chat"),
      isGroup: chat.isGroup,
      lastMessage: chat.messages[0]
        ? {
            content: chat.messages[0].content,
            timestamp: chat.messages[0].timestamp,
            isOwnMessage: chat.messages[0].senderId === userId,
          }
        : null,
      users: chat.users.filter((u) => u.id !== userId),
    }));

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
        email: true,
        avatar: true,
        about: true,
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

exports.sendMessage = (req, res) => {
  // Logic to send a new message
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
      },
    });
    console.log("Existing chat:", existingChat);
    console.log("Length:", existingChat.users.length);

    if (existingChat && existingChat.users.length === 2) {
      return res.json(existingChat);
    }

    // If no existing chat, create a new one
    const newChat = await prisma.chat.create({
      data: {
        isGroup: false,
        users: {
          connect: [{ id: req.user.id }, { id: req.body.otherUserId }],
        },
      },
    });

    console.log("New Chat", newChat);

    res.json(newChat);
  } catch (err) {
    console.error("Error creating new chat:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteMessage = (req, res) => {
  const { messageId } = req.params;
  // Logic to delete a specific message
};
