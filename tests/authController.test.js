const chai = require("chai");
const sinon = require("sinon");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const server = require("../index");
const User = require("../models/User");
const { beforeEach } = require("mocha");
const expect = chai.expect;

describe("Signup Handler [/api/auth/signup]", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Should create a new user in the db when unique username and password are provided", async () => {
    const req = {
      body: {
        username: "test",
        password: "test",
      },
    };
    sandbox.stub(User, "findOne").resolves(null);
    sandbox.stub(User.prototype, "save").resolves({
      _id: "test_id",
      username: "test",
      password: "hashedPassword",
    });
    sandbox.stub(jwt, "sign").returns("test_id_token");

    const res = await request(server).post("/api/auth/signup").send(req.body);

    expect(User.findOne.calledWith({ username: "test" })).to.be.true;
    expect(User.prototype.save.called).to.be.true;

    expect(res.status).equal(201);
    expect(res.body.message).equal("User created successfully.");
    expect(res.headers["set-cookie"][0]).contains("token=test_id_token;");
  });

  it("Should not create a new user in the db when username already exists", async () => {
    const req = {
      body: {
        username: "test",
        password: "test",
      },
    };
    sandbox.stub(User, "findOne").resolves({
      _id: "test_id",
      username: "test",
      password: "hashedPassword",
    });

    const res = await request(server).post("/api/auth/signup").send(req.body);

    expect(User.findOne.calledWith({ username: "test" })).to.be.true;
    expect(res.status).equal(409);
    expect(res.body.message).equal("Username already exists.");
    expect(res.headers["set-cookie"]).to.be.undefined;
  });

  it("Should not create a new user in the db when username or password are not provided", async () => {
    const req = {
      body: {
        username: "",
        password: "",
      },
    };

    const res = await request(server).post("/api/auth/signup").send(req.body);

    expect(res.status).equal(400);
    expect(res.body.message).equal("Username and password are required.");
    expect(res.headers["set-cookie"]).to.be.undefined;
  });
});

describe("Login Handler [/api/auth/login]", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Should return a JWT token in response cookie when valid username and password are provided", async () => {
    const req = {
      body: {
        username: "test",
        password: "test",
      },
    };

    //Simulating a user with correct password
    sandbox.stub(User, "findOne").resolves({
      _id: "test_id",
      username: "test",
      password: "hashedPassword",
      comparePassword: sandbox.stub().resolves(true),
    });
    sandbox.stub(jwt, "sign").returns("test_id_token");

    const res = await request(server).post("/api/auth/login").send(req.body);

    expect(User.findOne.calledWith({ username: "test" })).to.be.true;

    expect(res.status).equal(200);
    expect(res.headers["set-cookie"][0]).contains("token=test_id_token;");
    expect(res.body.message).equal("Logged in successfully.");
  });

  it("Should not login when username is invlaid", async () => {
    const req = {
      body: {
        username: "test",
        password: "test",
      },
    };

    sandbox.stub(User, "findOne").resolves(null);

    const res = await request(server).post("/api/auth/login").send(req.body);

    expect(User.findOne.calledWith({ username: "test" })).to.be.true;

    expect(res.status).equal(401);
    expect(res.body.message).equal("Invalid username or password.");
    expect(res.headers["set-cookie"]).to.be.undefined;
  });

  it("Should not login when password is invalid", async () => {
    const req = {
      body: {
        username: "test",
        password: "test",
      },
    };

    //Simulating a user with in-correct password
    sandbox.stub(User, "findOne").resolves({
      _id: "test_id",
      username: "test",
      password: "hashedPassword",
      comparePassword: sandbox.stub().resolves(false),
    });

    const res = await request(server).post("/api/auth/login").send(req.body);

    expect(User.findOne.calledWith({ username: "test" })).to.be.true;

    expect(res.status).equal(401);
    expect(res.body.message).equal("Invalid username or password.");
    expect(res.headers["set-cookie"]).to.be.undefined;
  });
});
