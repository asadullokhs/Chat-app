const express = require("express");
const router = express.Router();

const userCtrl = require("../controller/userCtrl");

router.get("/users", userCtrl.getAll);
router.get("/user/:userId", userCtrl.getOne);

module.exports = router;
