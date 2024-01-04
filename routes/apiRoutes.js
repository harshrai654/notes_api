const express = require("express");
const authRoutes = require("./authRoutes");
const notesRoutes = require("./notesRoutes");
const searchRoutes = require("./searchRoutes");
const authenticateUser = require("../middlewares/authenticateUser");

const router = express.Router();

// Mount the authRoutes router on /api
router.use("/auth", authRoutes);

// Mount the notesRoutes router on /api
router.use("/notes", authenticateUser, notesRoutes);

router.use("/search", authenticateUser, searchRoutes);

module.exports = router;
