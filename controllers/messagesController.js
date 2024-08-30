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
        users: {
          some: {
            id: {
              in: [req.user.id, req.otherUserId],
            },
          },
        },
      },
    });

    const userCount = await prisma.chat.count({
      where: {
        id: existingChat?.id,
        users: {
          some: {
            id: {
              notIn: [req.user.id, req.otherUserId],
            },
          },
        },
      },
    });

    if (existingChat && userCount === 0) return res.json(existingChat);

    // If no existing chat, create a new one
    const newChat = await prisma.chat.create({
      data: {
        isGroup: false,
        users: {
          connect: [{ id: req.user.id }, { id: req.otherUserId }],
        },
      },
    });

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
