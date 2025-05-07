import app from "./app.ts";
import { closeRabbitMQ } from "./infra/RabbitMq.ts";

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  server.close(() => {
    console.log("HTTP server closed.");
  });

  await closeRabbitMQ();

  process.exit(0);
});
