const express = require("express");
const verifyToken = require("../middleware/verifyToken");

const controller = require("../controllers/userController");
const router = express.Router();

router.use(verifyToken);

router.post("/upload-avatar", controller.updateAvatar);
router.post("/about-update", controller.updateAbout);

module.exports = router;
