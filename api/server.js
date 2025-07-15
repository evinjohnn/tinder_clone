// api/server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import helmet from "helmet";
import compression from "compression";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import premiumRoutes from "./routes/premiumRoutes.js";
import promptRoutes from "./routes/promptRoutes.js";
import advancedFilterRoutes from "./routes/advancedFilterRoutes.js";

// Config and utilities
import { connectDB } from "./config/db.js";
import { initializeSocket } from "./socket/socket.server.js";
import { updateLastActive } from "./middleware/auth.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

// Initialize Socket.IO
initializeSocket(httpServer);

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Compression middleware
app.use(compression());

// Body parsing middleware with large limits for image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS configuration
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

// Update last active for authenticated requests
app.use(updateLastActive);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/prompts", promptRoutes);
app.use("/api/filters", advancedFilterRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/client/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: "Something went wrong!" 
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: "Route not found" 
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
    connectDB();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    httpServer.close(() => {
        console.log('Process terminated');
    });
});