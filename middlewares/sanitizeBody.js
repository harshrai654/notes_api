const xss = require("xss");

module.exports = (req, res, next) => {
  for (const [key, value] of Object.entries(req.body)) {
    req.body[key] = xss(value);
  }
  next();
};
