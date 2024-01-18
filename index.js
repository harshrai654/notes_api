require("dotenv").config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const yaml = require("yamljs");
const { initDB } = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const apiRoutes = require("./routes/apiRoutes");
const sanitizeBody = require("./middlewares/sanitizeBody");
const app = express();

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

initDB(process.env.DB_URI, process.env.DB_NAME);

//Using default 50 req/min/ip rate limitjng for all requests
app.use(limiter);

app.use("/api", sanitizeBody, apiRoutes);

module.exports = app;
