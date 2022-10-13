const express = require("express");
const userCtrl = require("../controllers/user");
const verifyPassword = require("../middleware/passwordValidator");
const max = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/signup", verifyPassword, userCtrl.signup);
router.post("/login", max.limiter, userCtrl.login);

module.exports = router;
