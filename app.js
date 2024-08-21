const express = require("express")
const logger = require("morgan")

const app = express()


app.use("morgan")

app.use("")




app.get("/", (req, res, next) => {
    res.send("Hello, World")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`))