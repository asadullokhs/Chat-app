const express = require("express");
const router = express.Router();

const messageCtrl = require("../controller/messageCtrl");
const authMiddlewear = require("../middlewear/authMiddleware");

router.post("/", authMiddlewear, messageCtrl.addMessage);
router.get("/:chatId", authMiddlewear, messageCtrl.getMessages);
router.delete("/:messageId", authMiddlewear, messageCtrl.deleteMessage);
router.put("/:messageId", authMiddlewear, messageCtrl.updateMessage);

module.exports = router;
