require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = (tokenOrReq, res, next) => {
  let token;

  // Check if it's a regular HTTP request or a socket handshake
  if (tokenOrReq.headers) {
    // It's an HTTP request
    const authHeader = tokenOrReq.headers["authorization"];
    token = authHeader && authHeader.split(" ")[1];
  } else {
    // It's a socket handshake
    token = tokenOrReq;
  }

  if (!token) {
    if (res) {
      return res
        .status(403)
        .json({ message: "A token is required for authentication" });
    } else {
      throw new Error("A token is required for authentication");
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenOrReq.headers) {
      // For HTTP requests
      tokenOrReq.user = decoded;
      next();
    } else {
      // For socket connections
      return decoded;
    }
  } catch (err) {
    console.error("Token error:", err);
    if (err.name === "TokenExpiredError") {
      if (res) {
        return res.status(401).json({ message: "Token expired." });
      } else {
        throw new Error("Token expired.");
      }
    }
    if (res) {
      return res.status(403).json({ message: "Invalid token." });
    } else {
      throw new Error("Invalid token.");
    }
  }
};

module.exports = verifyToken;
