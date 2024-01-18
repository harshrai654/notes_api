const app = require("./index");
const { closeDBConnections } = require("./config/db");
let port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`API server listening on port: ${port}`);
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
