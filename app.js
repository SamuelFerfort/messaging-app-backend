const express = require("express");
const logger = require("morgan");
const authRouter = require("./routes/authRouter");
const messagesRouter = require("./routes/messagesRouter");
const userRouter = require("./routes/userRouter");
require("dotenv").config()
const passportInit = require("./config/passport");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

passportInit(app);
console.log("DATABASE_URL:", process.env.DATABASE_URL);
app.use(logger("dev"));

app.use("/api/auth/", authRouter);
app.use("/api", messagesRouter);
app.use("/api/user/", userRouter);

app.post("/test", (req, res) => {
  res.json({ receivedBody: req.body });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});