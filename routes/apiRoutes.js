const express = require("express");
const authRoutes = require("./authRoutes");
const notesRoutes = require("./notesRoutes");

const router = express.Router();

// Mount the authRoutes router on /api
router.use("/auth", authRoutes);

// Mount the notesRoutes router on /api
router.use("/notes", notesRoutes);

module.exports = router;
