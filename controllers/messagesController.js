const { PrismaClient } = require("@prisma/client");
const formatChat = require("../helpers/formatChat");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const fileSizeLimit = require("../middleware/fileSizeLimit");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const prisma = new PrismaClient();

module.exports = function (io) {
  return {
    startGroup: async (req, res) => {
      const { userIds, name } = req.body;

      if (!name || name.trim().length === 0 || name.length > 30) {
        return res.status(400).json({ message: "Invalid name input" });
      }

      if (userIds.length <= 0) {
        return res.status(400).json({ message: "Invalid users input" });
      }

      try {
        const uniqueUserIds = Array.from(
          new Set([...userIds.map((user) => user.id), req.user.id])
        );

        const group = await prisma.chat.create({
          data: {
            isGroup: true,
            name: name.trim(),
            users: {
              connect: uniqueUserIds.map((id) => ({ id })),
            },
          },
          include: {
            users: true,
          },
        });

        const formattedGroupChat = formatChat(group, req.user.id);
        res.status(201).json({ success: true, group: formattedGroupChat });
      } catch (err) {
        console.error("Error creating group chat:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    },

    getMessages: async (req, res) => {
      const { chatId } = req.params;

      try {
        const messages = await prisma.message.findMany({
          where: { chatId },
          include: {
            sender: {
              select: {
                avatar: true,
              },
            },
          },
        });

        res.json(messages);
      } catch (err) {
        console.error("Error getting messages:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    },
    sendMessage: [
      upload.single("image"),
      fileSizeLimit,
      async (req, res) => {
        const { content, receiverId, type } = req.body;
        const chatId = req.params.chatId;
        const senderId = req.user.id;

        if (!content && !req.file) {
          return res.status(400).json({ message: "Content required" });
        }

        if (type !== "TEXT" && type !== "IMAGE") {
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

          io.to(chatId).emit("new message", message);

          const chatMembers = await prisma.chat.findUnique({
            where: { id: chatId },
            include: { users: true },
          });

          chatMembers.users.forEach((user) => {
            if (user.id !== senderId) {
              console.log(
                "Emitting new message notification to user:",
                user.id
              );
              io.to(user.id.toString()).emit("new message notification", {
                chatId: chatId,
                message: message,
              });
            }
          });

          res.status(201).json(message);
        } catch (err) {
          console.error("Error creating message:", err);
          res.status(500).json({ error: "Internal server error" });
        }
      },
    ],

    startChat: async (req, res) => {
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

        res.json(formatChat(newChat, req.user.id));
      } catch (err) {
        console.error("Error creating new chat:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    },

    getUsers: async (req, res) => {
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
    },
    getChatsForUser: async (req, res) => {
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
                about: true,
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
    },

    joinChat: (socket, chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.user.id} joined chat ${chatId}`);
    },

    leaveChat: (socket, chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.user.id} left chat ${chatId}`);
    },
  };
};
