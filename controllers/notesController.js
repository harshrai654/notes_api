const express = require("express");
const router = express.Router();

// Define routes for /api/notes
router.get("/", (req, res) => {
  // Handle fetching notes logic
  res.send("Fetch notes route");
});

router.post("/", (req, res) => {
  // Handle creating a new note logic
  res.send("Create note route");
});

module.exports = router;
