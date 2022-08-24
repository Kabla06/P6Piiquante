const express = require("express");
const router = express.Router();
const sauceCtrl = require("../controllers/sauce");

router.post("/", sauceCtrl.createSauce);
router.get("/", sauceCtrl.getSauces);

module.exports = router;
