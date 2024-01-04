const Notes = require("../models/Note");
const jwt = require("jsonwebtoken");

module.exports = {
  async getAllNotes(req, res) {
    const { userId } = req;

    try {
      const notes = await Notes.find({ user: userId });
      res.send(notes);
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "Some error occurred while retrieving notes.",
      });
    }
  },

  async createNote(req, res) {
    const { userId } = req;
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .send({ message: "Note title or content is required." });
    }

    try {
      const newNote = await Notes.create({
        title,
        content,
        user: userId,
      });
      res.status(201).send({
        message: "Note created successfully.",
        note: newNote,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "Some error occurred while creating the note.",
      });
    }
  },

  /**
   * Updates a note in the database and returns updated note
   * Takes note ID from URL and data from request body [/api/notes/:noteId]
   */
  async updateNote(req, res) {
    const noteId = req.params.noteId;
    const { note } = req;
    const { title, content } = req.body;

    if (!title && !content) {
      return res
        .status(400)
        .send({ message: "Note title or content is required." });
    }

    try {
      const { title: savedTitle, content: savedContent } = note;
      const updatedNotesData = {};

      if (title && title !== savedTitle) {
        updatedNotesData.title = title;
      }
      if (content && content !== savedContent) {
        updatedNotesData.content = content;
      }

      //Check if db write is needed
      if (Object.keys(updatedNotesData).length) {
        const updatedNote = await Notes.findByIdAndUpdate(
          noteId,
          updatedNotesData,
          {
            new: true,
          }
        );
        res.send({
          message: "Note updated successfully.",
          note: updatedNote,
        });
      } else {
        res.send({
          message: "No data to update.",
          note,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "Some error occurred while updating the note.",
      });
    }
  },

  /**
   * Gets note from DB from noteID
   * Only returns note if user is the author
   */
  async getNote(req, res) {
    const { noteId } = req.params;
    const cookie = req?.cookies?.token;
    const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
    const { userId } = decoded;

    if (!noteId) {
      return res.status(400).send({ message: "Note ID is required." });
    }

    try {
      const note = await Notes.findById(noteId);

      if (!note) {
        return res.status(404).send({ message: "Note not found." });
      }

      const isNoteSharedWithRequester = note.sharedWith.includes(userId);
      const isRequesterNoteOwner = note.user.toString() === userId;

      if (!isNoteSharedWithRequester && !isRequesterNoteOwner) {
        return res
          .status(403)
          .send({ message: "You are not authorized to view this note." });
      }

      res.send(note);
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: "Some error occurred while retrieving the note.",
      });
    }
  },

  /**
   * Deletes note from DB
   * Only deletes note if user is the author
   * */
  async deleteNote(req, res) {
    const noteId = req?.params?.noteId;

    try {
      await Notes.findByIdAndDelete(noteId);

      return res.status(204).send({
        message: "Note deleted successfully.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: "Some error occurred while deleting the note.",
      });
    }
  },

  /**
   * Share note with another user
   * */
  async shareNote(req, res) {
    const noteId = req?.params?.noteId;
    const { toUserId } = req.body;

    if (!toUserId) {
      return res
        .status(400)
        .send({ message: "Destination user ID is required." });
    }

    try {
      const note = await Notes.findByIdAndUpdate(noteId, {
        $addToSet: { sharedWith: toUserId },
      });

      res.send({
        message: `Note shared successfully with user ${toUserId}.`,
        note,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "Some error occurred while sharing the note.",
      });
    }
  },
};
