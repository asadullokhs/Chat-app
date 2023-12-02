const express = require("express");
const router = express.Router();

const userCtrl = require("../controller/userCtrl");
const authMiddlewear = require("../middlewear/authMiddleware");

router.get("/", userCtrl.getAll);
router.get("/:userId", userCtrl.getOne);
// router.put("/:userId", userCtrl.update);
router.delete("/:userId", authMiddlewear, userCtrl.deleteUser);

module.exports = router;
