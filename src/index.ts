import { createApp } from "./app.ts";
import { MongoDbClient } from "./infra/mongodb/db.ts";
import { RabbitMQClient } from "./infra/rabbitmq/rabbit-mq.ts";

const PORT = process.env.PORT || 3007;

const startServer = async () => {
  try {
    const app = await createApp();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("Shutting down server...");
      server.close(() => console.log("HTTP server closed."));

      await RabbitMQClient.getInstance().close();
      await MongoDbClient.getInstance().disconnect();

      process.exit(0);
    });
  } catch (err) {
    console.error("Failed to start the server:", err);
    process.exit(1);
  }
};

startServer();
