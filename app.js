const express = require("express");
const logger = require("morgan");
const authRouter = require("./routes/authRouter");
const messagesRouter = require("./routes/messagesRouter");
const passportInit = require("./config/passport");
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
  })
);

passportInit(app);

app.use(logger("dev"));

app.use((req, res, next) => {
  console.log("Received request:");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

app.get("/", (req, res, next) => {
  res.send("Hello, World");
});

app.use("/api/auth/", authRouter);
app.use("/api", messagesRouter);

app.post("/test", (req, res) => {
  console.log("Test route body:", req.body);
  res.json({ receivedBody: req.body });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
