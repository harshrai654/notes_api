const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

//Mapping authentication routes to corresponding controller
router.post("/signup", authController.handleSignUp);
router.post("/login", authController.handleLogIn);

module.exports = router;
