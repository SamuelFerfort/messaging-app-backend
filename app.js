const express = require("express");
const logger = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const verifyToken = require("./middleware/verifyToken"); // Make sure this path is correct
require("dotenv").config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware to authenticate socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const user = verifyToken(token);
    socket.user = user;
    next();
  } catch (err) {
    return next(new Error(err.message));
  }
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.join(socket.user.id.toString());

  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.user.id} joined chat ${chatId}`);
  });

  socket.on("leave chat", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.user.id} left chat ${chatId}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(`User ${socket.user.id} disconnected. Reason: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

io.engine.on("connection_error", (err) => {
  console.error("Connection error:", err);
});

const passportInit = require("./config/passport");
passportInit(app);

const authRouter = require("./routes/authRouter");
const messagesRouter = require("./routes/messagesRouter")(io);
const userRouter = require("./routes/userRouter");

app.use("/api/auth/", authRouter);
app.use("/api", messagesRouter);
app.use("/api/user/", userRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
