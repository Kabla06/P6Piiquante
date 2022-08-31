const express = require("express");
const sauceCtrl = require("../controllers/sauce");
const multer = require("../middleware/multer");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/", auth, multer, sauceCtrl.createSauce);
router.get("/", auth, sauceCtrl.getSauces);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.put("/:id", auth, multer, sauceCtrl.updateOne);
router.delete("/:id", auth, sauceCtrl.deleteSauce);

module.exports = router;
