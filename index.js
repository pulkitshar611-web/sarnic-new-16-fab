import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./app.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import "./cron/dailyEmailSender.js";

// Load environment variables
dotenv.config();

const app = express();
// Ensure PORT is a number and fallback to 3001
const PORT = Number(process.env.PORT) || 3001;

// Global error handlers to capture startup crashes
process.on("uncaughtException", (err) => {
  console.error("🔥 CRITICAL: Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("🔥 CRITICAL: Unhandled Rejection at:", promise, "reason:", reason);
});

// Root / Health check route (Absolute top priority)
app.get("/", (req, res) => {
  console.log("✅ Health check hit at /");
  res.status(200).json({
    status: "ok",
    message: "Sarnic Backend is running",
    environment: process.env.NODE_ENV || "development",
    serverTime: new Date().toISOString(),
    port: PORT
  });
});

app.get("/api/ics-proxy", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }
    console.log(`📡 Proxying ICS from: ${url}`);
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader("Content-Type", "text/calendar");
    res.send(text);
  } catch (error) {
    console.error(`❌ Proxy Error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.use(
  cors({
    origin: ["http://localhost:5173", "https://sarnic-latest-one.netlify.app", "https://project.phoenix-dezign.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(process.cwd(), "tmp"),
    createParentPath: true,
  })
);

app.use(routes);

// Final fallback for 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

console.log(`🔧 Attempting to start server on port ${PORT}...`);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server successfully running on port ${PORT}`);
  console.log(`🌍 Network accessible at http://0.0.0.0:${PORT}/`);
});

server.on("error", (error) => {
  console.error("❌ SERVER STARTUP ERROR:", error);
});

