require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const apiRoutes = require("./routes/apiRoutes");
const app = express();
const port = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

//Using default 50 req/min/ip rate limitjng for all requests
app.use(limiter);

app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`API server listening on port: ${port}`);
});
