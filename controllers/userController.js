const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const prisma = new PrismaClient();

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.updateAvatar = [
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Convert the buffer to a base64-encoded string
      const fileStr = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      const result = await cloudinary.uploader.upload(fileStr, {
        folder: "user_avatars",
      });

      const userId = req.user.id;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: result.secure_url },
      });

      res.json({ success: true, user });
    } catch (err) {
      console.error("Error uploading avatar to cloudinary", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

exports.updateAbout = async (req, res) => {
  const about = req.body.about;
    
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { about },
    });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
