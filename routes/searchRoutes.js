const express = require("express");
const router = express.Router();
const userActionsController = require("../controllers/userActionsController");

//Mapping user action routes to corresponding controller
router.get("/", userActionsController.searchNotesByKeywords);

module.exports = router;
