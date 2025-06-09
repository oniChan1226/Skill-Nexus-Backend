import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/index.js"

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());

// Routes
import authRoutes from "./routes/auth/auth.routes.js"

app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Welcome...");
});

app.use(errorHandler)

export default app;