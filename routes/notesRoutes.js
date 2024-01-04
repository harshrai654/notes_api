const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");
const authenticateNoteOwner = require("../middlewares/authenticateNoteOwner");

// Define routes for /api/notes

router.get("/", notesController.getAllNotes);
router.post("/", notesController.createNote);
router.put("/:noteId", authenticateNoteOwner, notesController.updateNote);
router.get("/:noteId", notesController.getNote);
router.delete("/:noteId", authenticateNoteOwner, notesController.deleteNote);
router.post("/:noteId/share", authenticateNoteOwner, notesController.shareNote);

module.exports = router;
