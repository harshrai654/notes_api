const Note = require("../../models/Note");

module.exports = {
  async createNotesForUser(user) {
    const note = await Note.create({
      title: "Test Note",
      content: "Test Content",
      user: user._id,
    });
    return note;
  },

  async deleteNotesForUser(user) {
    await Note.deleteMany({ user: user._id });
  },
};
