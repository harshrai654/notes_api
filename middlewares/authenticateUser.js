const jwt = require("jsonwebtoken");

module.exports = function authenticateUser(req, res, next) {
  const cookie = req?.cookies?.token;

  if (!cookie) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized" });
  }
};
