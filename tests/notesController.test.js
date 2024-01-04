const chai = require("chai");
const sinon = require("sinon");
const request = require("supertest");
const server = require("../index");
const Notes = require("../models/Note");
const User = require("../models/User");
const expect = chai.expect;

describe("Notes Controller [/api/notes]", () => {
  let sandbox;
  let user;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Should create a new note in the db when authenticated user is provided", async () => {});
});
