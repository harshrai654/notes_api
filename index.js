require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const yaml = require("yamljs");
const swaggerUi = require("swagger-ui-express");
const { initDB, closeDBConnections } = require("./config/db");
const apiRoutes = require("./routes/apiRoutes");
const sanitizeBody = require("./middlewares/sanitizeBody");
const app = express();
let port = 5000;

if (process.env.NODE_ENV === "test") {
  port = 3000;
} else {
  port = process.env.PORT || 5000;
}

//ToDo: Implement mem cache

app.use(express.json());
app.use(cookieParser());
const swaggerDocument = yaml.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

//Using default 50 req/min/ip rate limitjng for all requests
app.use(limiter);

app.use("/api", sanitizeBody, apiRoutes);

const server = app.listen(port, () => {
  console.log(`API server listening on port: ${port}`);
  if (process.env.NODE_ENV !== "test") {
    initDB(process.env.DB_URI, process.env.DB_NAME);
  } else {
    initDB(process.env.TEST_DB_URI, process.env.TEST_DB_NAME);
  }
});

function shutdownGracefully() {
  console.log("Shutting down gracefully");
  server.close(async (err) => {
    await closeDBConnections();
    process.exit(err ? 1 : 0);
  });
}

process.on("SIGTERM", shutdownGracefully);
process.on("SIGINT", shutdownGracefully);

module.exports = app;
