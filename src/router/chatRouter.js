const express = require("express");
const router = express.Router();

const chatCtrl = require("../controller/chatCtrl");
const authMiddlewear = require("../middlewear/authMiddleware");

router.get("/", authMiddlewear, chatCtrl.userChat);
router.get("/:firstId/:secondId", authMiddlewear, chatCtrl.findChat);
router.delete("/:chatId", authMiddlewear, chatCtrl.deleteChat);

module.exports = router;
