const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");

// Mount the notesController router on /api/notes
router.use("/notes", notesController);

module.exports = router;
