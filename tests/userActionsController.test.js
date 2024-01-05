const chai = require("chai");
const sinon = require("sinon");
const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../index");
const Notes = require("../models/Note");
const expect = chai.expect;
const fakeUsers = require("./fake-data/fakeUsers");
const fakeNotes = require("./fake-data/fakeNotes");

describe("User Actions Controller [/api/search]", () => {
  let sandbox;
  let user;
  let note;
  let userJwtToken;

  before(async () => {
    user = await fakeUsers.createFakeUsers({
      username: "test",
      password: "test",
    });
    note = await fakeNotes.createNotesForUser(user);
    userJwtToken = fakeUsers.getJWTToken(user);
  });

  after(async () => {
    await fakeUsers.deleteFakeUsers();
    await fakeNotes.deleteNotesForUser(user);
  });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
  });

  afterEach(async () => {
    sandbox.restore();
  });

  it("Should fetch correct notes as per search query", async () => {
    const res = await request(server)
      .get(`/api/search?q=${note.title}`)
      .set("Cookie", `token=${userJwtToken}`);
    expect(res.status).equal(200);
    expect(res.body.length).equal(1);
    expect(res.body[0].title).equal(note.title);
    expect(res.body[0].content).equal(note.content);
  });

  it("Should not fetch notes when user is not authenticated", async () => {
    const res = await request(server).get(`/api/search?q=test`);
    expect(res.status).equal(401);
    expect(res.body.message).equal("Unauthorized");
  });

  it("Should handle internal server error", async () => {
    sandbox.stub(Notes, "find").throws();
    const res = await request(server)
      .get(`/api/search?q=test`)
      .set("Cookie", `token=${userJwtToken}`);
    expect(res.status).equal(500);
    expect(res.body.message).equal(
      "Some error occurred while searching for notes."
    );
  });

  it("Should handle request when search query is empty", async () => {
    const res = await request(server)
      .get(`/api/search?q=`)
      .set("Cookie", `token=${userJwtToken}`);
    expect(res.status).equal(400);
    expect(res.body.message).equal("Search query is required.");
  });
});
