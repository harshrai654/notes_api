const chai = require("chai");
const sinon = require("sinon");
const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../index");
const Notes = require("../models/Note");
const expect = chai.expect;
const fakeUsers = require("./fake-data/fakeUsers");
const fakeNotes = require("./fake-data/fakeNotes");

describe("Notes Controller [/api/notes]", () => {
  let sandbox;
  let user;
  let note;
  let userJwtToken;

  before(async () => {
    user = await fakeUsers.createFakeUsers({
      username: "test",
      password: "test",
    });
    userJwtToken = fakeUsers.getJWTToken(user);
  });

  after(async () => {
    await fakeUsers.deleteFakeUsers();
  });

  describe("Get Notes Handler [/api/notes]", () => {
    beforeEach(async () => {
      sandbox = sinon.createSandbox();
      note = await fakeNotes.createNotesForUser(user);
    });

    afterEach(async () => {
      sandbox.restore();
      await fakeNotes.deleteNotesForUser(user);
    });

    it("Should get all notes when authenticated user is provided", async () => {
      const res = await request(server)
        .get("/api/notes")
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(200);
      expect(res.body.length).equal(1);
      expect(res.body[0].title).equal(note.title);
      expect(res.body[0].content).equal(note.content);
    });

    it("Should not get notes when user is not authenticated", async () => {
      const res = await request(server).get("/api/notes");

      expect(res.status).equal(401);
      expect(res.body.message).equal("Unauthorized");
    });

    it("Should handle internal server error", async () => {
      sandbox.stub(Notes, "find").throws();

      const res = await request(server)
        .get("/api/notes")
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(500);
      expect(res.body.message).equal(
        "Some error occurred while retrieving notes."
      );
    });
  });

  describe("Create Notes Handler [/api/notes]", () => {
    beforeEach(async () => {
      sandbox = sinon.createSandbox();
    });

    afterEach(async () => {
      sandbox.restore();
    });

    it("Should create a new note in the db when authenticated user is provided", async () => {
      const req = {
        cookies: {
          token: userJwtToken,
        },
        body: {
          title: "Test Note",
          content: "Test Content",
        },
      };

      const res = await request(server)
        .post("/api/notes")
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(201);
      expect(res.body.message).equal("Note created successfully.");
      expect(res.body.note.title).equal(req.body.title);
      expect(res.body.note.content).equal(req.body.content);
    });

    it("Should not create test note when malformed data is provided", async () => {
      const req = {
        cookies: {
          token: userJwtToken,
        },
        body: {
          title: "Test Note",
        },
      };

      const res = await request(server)
        .post("/api/notes")
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(400);
      expect(res.body.message).equal("Note title or content is required.");
    });

    it("Should not create test note when user is not authenticated", async () => {
      const req = {
        body: {
          title: "Test Note",
          content: "Test Content",
        },
      };

      const res = await request(server).post("/api/notes").send(req.body);

      expect(res.status).equal(401);
      expect(res.body.message).equal("Unauthorized");
    });

    it("Should handle internal server error", async () => {
      const req = {
        body: {
          title: "Test Note",
          content: "Test Content",
        },
      };
      sandbox.stub(Notes, "create").throws();

      const res = await request(server)
        .post("/api/notes")
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(500);
      expect(res.body.message).equal(
        "Some error occurred while creating the note."
      );
    });
  });

  describe("Get Note Handler [/api/notes/:noteId]", () => {
    beforeEach(async () => {
      sandbox = sinon.createSandbox();
      note = await fakeNotes.createNotesForUser(user);
    });

    afterEach(async () => {
      sandbox.restore();
      await fakeNotes.deleteNotesForUser(user);
    });

    it("Should get note when authenticated user provides valid note id", async () => {
      const noteId = note._id;

      const res = await request(server)
        .get(`/api/notes/${noteId}`)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(200);
      expect(res.body.title).equal(note.title);
      expect(res.body.content).equal(note.content);
    });

    it("Should not get note when user is not authenticated", async () => {
      const noteId = note._id;

      const res = await request(server).get(`/api/notes/${noteId}`);

      expect(res.status).equal(401);
      expect(res.body.message).equal("Unauthorized");
    });

    //For invalid note id findById throws error since it is not a valid ObjectId
    it("Should handle internal server error", async () => {
      const noteId = "123";

      const res = await request(server)
        .get(`/api/notes/${noteId}`)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(500);
      expect(res.body.message).equal(
        "Some error occurred while retrieving the note."
      );
    });

    it("Should not get access to note of some other user(if note is not shared by original author)", async () => {
      const noteId = note._id;
      const secondUser = await fakeUsers.createFakeUsers({
        username: "user_2",
        password: "pass_2",
      });

      const secondUserJwtToken = await fakeUsers.getJWTToken(secondUser);
      const res = await request(server)
        .get(`/api/notes/${noteId}`)
        .set("Cookie", `token=${secondUserJwtToken}`);

      expect(res.status).equal(403);
      expect(res.body.message).equal(
        "You are not authorized to view this note."
      );
    });
  });

  describe("Update Note Handler [/api/notes/:noteId]", () => {
    beforeEach(async () => {
      sandbox = sinon.createSandbox();
      note = await fakeNotes.createNotesForUser(user);
    });

    afterEach(async () => {
      sandbox.restore();
      await fakeNotes.deleteNotesForUser(user);
    });

    it("Should update note when authenticated user provides valid note id and data", async () => {
      const noteId = note._id;

      const req = {
        body: {
          title: "Updated Note",
          content: "Updated Content",
        },
      };

      const res = await request(server)
        .put(`/api/notes/${noteId}`)
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(200);
      expect(res.body.note.title).equal(req.body.title);
      expect(res.body.note.content).equal(req.body.content);
      expect(res.body.message).equal("Note updated successfully.");
    });

    it("Should not update note when user is not authenticated", async () => {
      const noteId = note._id;

      const req = {
        body: {
          title: "Updated Note",
          content: "Updated Content",
        },
      };

      const res = await request(server)
        .put(`/api/notes/${noteId}`)
        .send(req.body);

      expect(res.status).equal(401);
      expect(res.body.message).equal("Unauthorized");
    });

    it("Should handle internal server error", async () => {
      const noteId = "invalid_note_id";

      const req = {
        body: {
          title: "Updated Note",
          content: "Updated Content",
        },
      };

      const res = await request(server)
        .put(`/api/notes/${noteId}`)
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(500);
      expect(res.body.message).equal(
        "Some error occurred while retrieving the note."
      );
    });

    it("Should not update note if authenticated user is not the author of the note", async () => {
      const noteId = note._id;

      const req = {
        body: {
          title: "Updated Note",
          content: "Updated Content",
        },
      };

      const secondUser = await fakeUsers.createFakeUsers({
        username: "user_3",
        password: "pass_3",
      });

      const secondUserJwtToken = fakeUsers.getJWTToken(secondUser);

      const res = await request(server)
        .put(`/api/notes/${noteId}`)
        .send(req.body)
        .set("Cookie", `token=${secondUserJwtToken}`);

      expect(res.status).equal(403);
      expect(res.body.message).equal(
        "You are not authorized to view this note."
      );
    });

    it("Should handle empty request body", async () => {
      const noteId = note._id;

      const req = {
        body: {},
      };

      const res = await request(server)
        .put(`/api/notes/${noteId}`)
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(400);
      expect(res.body.message).equal("Note title or content is required.");
    });

    it("Should not do DB write if provided data is equal to original data", async () => {
      const noteId = note._id;

      const req = {
        body: {
          title: note.title,
          content: note.content,
        },
      };

      const res = await request(server)
        .put(`/api/notes/${noteId}`)
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(200);
      expect(res.body.message).equal("No data to update.");
    });
  });

  describe("Delete Note Handler [/api/notes/:noteId]", () => {
    beforeEach(async () => {
      sandbox = sinon.createSandbox();
      note = await fakeNotes.createNotesForUser(user);
    });

    afterEach(async () => {
      sandbox.restore();
      await fakeNotes.deleteNotesForUser(user);
    });

    it("Should delete note when authenticated user provides valid note id", async () => {
      const noteId = note._id;

      const res = await request(server)
        .delete(`/api/notes/${noteId}`)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(204);
    });

    it("Should not delete note when user is not authenticated", async () => {
      const noteId = note._id;

      const res = await request(server).delete(`/api/notes/${noteId}`);

      expect(res.status).equal(401);
      expect(res.body.message).equal("Unauthorized");
    });

    it("Should handle internal server error", async () => {
      const noteId = "invalid_note_id";

      const res = await request(server)
        .delete(`/api/notes/${noteId}`)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(500);
      expect(res.body.message).equal(
        "Some error occurred while retrieving the note."
      );
    });

    it("Should not delete note if authenticated user is not the author of the note", async () => {
      const noteId = note._id;

      const secondUser = await fakeUsers.createFakeUsers({
        username: "user_5",
        password: "pass_5",
      });

      const secondUserJwtToken = fakeUsers.getJWTToken(secondUser);

      const res = await request(server)
        .delete(`/api/notes/${noteId}`)
        .set("Cookie", `token=${secondUserJwtToken}`);

      expect(res.status).equal(403);
      expect(res.body.message).equal(
        "You are not authorized to view this note."
      );
    });
  });

  describe("Share Note Handler [/api/notes/:noteId/share]", () => {
    let destinationUser;
    before(async () => {
      destinationUser = await fakeUsers.createFakeUsers({
        username: "destination_user",
        password: "pass_2",
      });
      note = await fakeNotes.createNotesForUser(user);
    });

    beforeEach(async () => {
      sandbox = sinon.createSandbox();
    });

    afterEach(async () => {
      sandbox.restore();
    });

    it("Should share note when authenticated user provides valid note id and destination user id", async () => {
      const noteId = note._id;
      const req = {
        body: {
          toUserId: destinationUser._id,
        },
      };

      const res = await request(server)
        .post(`/api/notes/${noteId}/share`)
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(200);
      expect(res.body.message).equal(
        `Note shared successfully with user ${destinationUser._id}.`
      );

      //Check if note is accessible to destination user
      const destinationUserJwtToken = fakeUsers.getJWTToken(destinationUser);

      const destinationUserNote = await request(server)
        .get(`/api/notes/${noteId}`)
        .set("Cookie", `token=${destinationUserJwtToken}`);

      expect(destinationUserNote.status).equal(200);
      expect(destinationUserNote.body.title).equal(note.title);
      expect(destinationUserNote.body.content).equal(note.content);
    });

    it("Should not share note when user is not authenticated", async () => {
      const noteId = note._id;
      const req = {
        body: {
          toUserId: destinationUser._id,
        },
      };

      const res = await request(server)
        .post(`/api/notes/${noteId}/share`)
        .send(req.body);

      expect(res.status).equal(401);
      expect(res.body.message).equal("Unauthorized");
    });

    it("Should handle internal server error", async () => {
      const noteId = note._id;
      const req = {
        body: {
          toUserId: "invlaid_user_id",
        },
      };

      const res = await request(server)
        .post(`/api/notes/${noteId}/share`)
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(500);
      expect(res.body.message).equal(
        "Some error occurred while sharing the note."
      );
    });

    it("Should not share note if authenticated user is not the author of the note", async () => {
      const noteId = note._id;
      const req = {
        body: {
          toUserId: destinationUser._id,
        },
      };

      const secondUser = await fakeUsers.createFakeUsers({
        username: "user_guest",
        password: "pass_5",
      });

      const secondUserJwtToken = fakeUsers.getJWTToken(secondUser);

      const res = await request(server)
        .post(`/api/notes/${noteId}/share`)
        .send(req.body)
        .set("Cookie", `token=${secondUserJwtToken}`);

      expect(res.status).equal(403);
      expect(res.body.message).equal(
        "You are not authorized to view this note."
      );
    });

    it("Should not share note if destination user does not exist", async () => {
      const noteId = note._id;
      const req = {
        body: {
          toUserId: new mongoose.Types.ObjectId(),
        },
      };

      const res = await request(server)
        .post(`/api/notes/${noteId}/share`)
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(404);
      expect(res.body.message).equal("Destination user not found.");
    });

    it("Should not share note if destination user not present in request", async () => {
      const noteId = note._id;
      const req = {
        body: {},
      };

      const res = await request(server)
        .post(`/api/notes/${noteId}/share`)
        .send(req.body)
        .set("Cookie", `token=${userJwtToken}`);

      expect(res.status).equal(400);
      expect(res.body.message).equal("Destination user ID is required.");
    });
  });
});
