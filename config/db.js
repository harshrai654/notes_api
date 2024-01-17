const mongoose = require("mongoose");
const CONNECTION_POOL_SIZE = process.env.CONNECTION_POOL_SIZE;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

module.exports = {
  initDB(DB_URI, DB_NAME) {
    mongoose
      .connect(DB_URI, {
        minPoolSize: CONNECTION_POOL_SIZE,
        auth: {
          authSource: "admin", // Specify the authentication database
        },
        user: DB_USER,
        pass: DB_PASSWORD,
        dbName: DB_NAME,
      })
      .catch((error) => console.error(`Error connecting to DB: ${error}`));

    mongoose.connection.on("connected", () =>
      console.log(`DB connection successful!`)
    );

    mongoose.connection.on("disconnected", () =>
      console.log(`DB connection disconnected!`)
    );

    mongoose.connection.on("error", (err) => console.log(`DB error: ${err}`));
  },

  closeDBConnections() {
    return mongoose.disconnect();
  },
};
