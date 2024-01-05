const jwt = require("jsonwebtoken");
const User = require("../../models/User");

module.exports = {
  async createFakeUsers(userObj) {
    const user = await User.create({
      username: "test",
      password: "test",
      ...userObj,
    });

    return user;
  },

  async deleteFakeUsers() {
    await User.deleteMany({});
  },

  getJWTToken(user) {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
  },
};
