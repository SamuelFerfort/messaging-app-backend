const { PrismaClient } = require("@prisma/client");
const formatChat = require("../helpers/formatChat");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
            about: true
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
    res.json(formatChat(newChat, req.user.id));
  } catch (err) {
    console.error("Error creating new chat:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.sendMessage = [
  upload.single("image"),

  async (req, res) => {
    const { content, receiverId, type } = req.body;
    const chatId = req.params.chatId;
    const senderId = req.user.id;

    console.log("Content:" ,content)
    console.log("File:" ,req.file)

    console.log("Type:" ,type)


    if (!content && !req.file) {
      console.log("no content or file bad request")
      return res.status(400).json({ message: "Content required" });
    }
      

    if (type !== "TEXT" && type !== "IMAGE") {
      console.log("BAD TYPE REQUEST")
      return res.status(400).json({ error: "Invalid message type" });
    }

    let messageContent = content;
    if (type === "IMAGE") {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      try {
        // Convert the buffer to a base64-encoded string
        const fileStr = `data:${
          req.file.mimetype
        };base64,${req.file.buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(fileStr, {
          folder: "image_messages",
        });
        messageContent = result.secure_url;
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    try {
      const message = await prisma.message.create({
        data: {
          content: messageContent,
          read: false,
          type: type,
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
  },
];

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
