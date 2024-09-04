const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const Joi = require("joi");

const prisma = new PrismaClient();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.registerPost = async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;
  const { error } = registerSchema.validate(req.body);

  const emailExists = await prisma.user.findUnique({ where: { email } });

  if (emailExists)
    return res.status(400).json({ message: "Email already in use" });

  if (error) return res.status(400).json({ message: error.details[0].message });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error registering the user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.loginPost = async (req, res) => {
  const { email, password } = req.body;

  const { error } = loginSchema.validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Email does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Wrong Password" });

    const payload = {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar || null,
      about: user.about || null,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Error logging in the user:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
