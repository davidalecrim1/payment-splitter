import cors from "cors";
import express from "express";
import { GroupRoutes } from "./routes/GroupRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/groups", GroupRoutes);

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
