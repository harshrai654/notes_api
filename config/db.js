const mongoose = require("mongoose");
const DB_URI = process.env.DB_URI;
const CONNECTION_POOL_SIZE = process.env.CONNECTION_POOL_SIZE;

mongoose
  .connect(DB_URI, {
    minPoolSize: CONNECTION_POOL_SIZE,
  })
  .catch((error) => console.error(`Error connecting to DB: ${error}`));

mongoose.connection.on("connected", () =>
  console.log(`DB connection successful!`)
);

mongoose.connection.on("disconnected", () =>
  console.log(`DB connection disconnected!`)
);

mongoose.connection.on("error", (err) => console.log(`DB error: ${err}`));

module.exports = mongoose.connection;
