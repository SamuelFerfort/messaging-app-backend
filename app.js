const express = require("express");
const logger = require("morgan");
const authRouter = require("./routes/authRouter")
const messagesRouter = require("./routes/messagesRouter")

const app = express();



app.use(logger("dev"));


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.get("/", (req, res, next) => {
  res.send("Hello, World");
});


app.use("/api/auth/", authRouter)
app.use("/api/messages/", messagesRouter)




app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send("Something broke!")
})



const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
