import { createApp } from "./app.ts";
import { closeRabbitMQ } from "./infra/RabbitMq.ts";

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    const app = await createApp();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("Shutting down server...");
      server.close(() => console.log("HTTP server closed."));
      await closeRabbitMQ();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
