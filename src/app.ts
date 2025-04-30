import cors from "cors";
import express from "express";
import { GroupRoutes } from "./routes/GroupRoutes.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/groups", GroupRoutes);

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

export default app;
