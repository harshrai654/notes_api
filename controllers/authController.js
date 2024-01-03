const User = require("../models/User");
const jwt = require("jsonwebtoken");

module.exports = {
  async handleSignUp(req, res, next) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .send({ message: "Username and password are required." });
    }

    try {
      // Check if username already exists in db
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(409).send({ message: "Username already exists." });
      }

      // Insert username and password into database
      const user = new User({ username, password });
      await user.save();

      // Create a JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      // Send JWT token in response as a cookie
      res.cookie("token", token, { httpOnly: true });

      // Send success message in response
      res.status(201).send({ message: "User created successfully." });
    } catch (error) {
      // Send error message in response if there is an error
      console.error(error);
      res.status(500).send("An error occurred during the sign-up process.");
    }
  },
  async handleLogIn(req, res, next) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .send({ message: "Username and password are required." });
    }
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return res
          .status(401)
          .send({ message: "Invalid username or password." });
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res
          .status(401)
          .send({ message: "Invalid username or password." });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.cookie("token", token, { httpOnly: true });

      res.status(200).send({ message: "Logged in successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred during the log-in process.");
    }
  },
};
