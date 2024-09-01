require("dotenv").config()
const jwt = require("jsonwebtoken")


const verifyToken = (req, res, next) => {

    console.log("verifyToken - Body before", req.body)

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).json({message: 'A token is required for authentication'});
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      console.error("Token error:" ,err)
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired.' });
          }
          return res.status(403).json({ message: 'Invalid token.' });
    }
  };


module.exports = verifyToken