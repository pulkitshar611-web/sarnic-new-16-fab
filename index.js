import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import routes from "./app.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import "./cron/dailyEmailSender.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Root / Health check route
app.get("/", (req, res) => {
  console.log("Health check hit at /");
  res.json({
    status: "ok",
    message: "Sarnic Backend is running",
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get("/api/ics-proxy", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }
    console.log(`Proxying ICS from: ${url}`);
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader("Content-Type", "text/calendar");
    res.send(text);
  } catch (error) {
    console.error(`Proxy Error: ${error.message}`);
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
    tempFileDir: "/tmp", // Use system tmp for better compatibility
    createParentPath: true,
  })
);

app.use(routes);

// Log when the server is about to start
console.log(`Attempting to start server on port ${PORT}...`);

// Bind to 0.0.0.0 for cloud deployments
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server successfully running on port ${PORT}`);
  console.log(`🌍 Health check available at http://0.0.0.0:${PORT}/`);
});

