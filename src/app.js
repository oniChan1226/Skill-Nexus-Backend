import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/index.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://skill-nexus-frontend.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());

// Base route
app.get("/", (req, res) => {
  res.send("Welcome...");
});

// Routes
import Routes from "./routes/index.js";
app.use("/api/v1", Routes);

// Catch-all (404)
app.use((req, res) => {
  res.status(404).send("Please bhai masti mat kro");
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
