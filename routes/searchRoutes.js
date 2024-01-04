const express = require("express");
const router = express.Router();
const userActionsController = require("../controllers/userActionsController");

//Mapping user action routes to corresponding controller
router.post("?q=:query", authController.handleSearch);

module.exports = router;
