const Notes = require("../models/Note");

module.exports = async function authenticateNoteOwner(req, res, next) {
  const { noteId } = req.params;
  const { userId } = req;

  if (!noteId) {
    return res.status(400).send({ message: "Note ID is required." });
  }

  try {
    const note = await Notes.findById(noteId);

    if (!note) {
      return res.status(404).send({ message: "Note not found." });
    }

    if (note.user.toString() !== userId) {
      return res
        .status(403)
        .send({ message: "You are not authorized to view this note." });
    }

    //Attaching note object to request
    req.note = note;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Some error occurred while retrieving the note.",
    });
  }
};
