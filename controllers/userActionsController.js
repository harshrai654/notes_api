const Notes = require("../models/Note");

module.exports = {
  async searchNotesByKeywords(req, res) {
    const { q } = req?.query;
    const { userId } = req;

    if (!q) {
      return res.status(400).send({ message: "Search query is required." });
    }

    try {
      //Text based search on notes associated with userId and keyword present
      //in note's title(text indexed) or content(text indexed)
      const notes = await Notes.find(
        {
          user: userId,
          $text: {
            $search: q,
            $language: "english", //Assuming English language for notes title and content for ignoring stopwords and stemming
          },
        },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });

      res.send(notes);
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "Some error occurred while searching for notes.",
      });
    }
  },
};
