import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";

import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static("public"));

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Notes API is running"
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;