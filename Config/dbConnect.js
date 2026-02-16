import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();



export const pool = mysql.createPool({
  host: process.env.DB_HOST || "turntable.proxy.rlwy.net",
  port: process.env.DB_PORT || 58831,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "MjCmXsOewThQyNsmcWoJLniCDabvysGI",
  database: process.env.DB_NAME || "railway",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000, // Increased timeout
});

// Check connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Successfully connected to Railway MySQL database");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    console.error("Host:", process.env.DB_HOST || "turntable.proxy.rlwy.net");
    console.error("Port:", process.env.DB_PORT || 58831);
  }
})();





