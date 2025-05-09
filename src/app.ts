import cors from "cors";
import express from "express";
import { createGroupRoutes } from "./routes/group-routes.ts";

export async function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const groupRoutes = await createGroupRoutes();
  app.use("/groups", groupRoutes);

  app.get("/ping", (req, res) => {
    res.status(200).json({ message: "pong" });
  });

  return app;
}
