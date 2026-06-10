import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure DATABASE_URL is set for runtime
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/dev.sqlite";
}

const nodePath = process.execPath;
const prismaCliPath = path.join(__dirname, "node_modules", "prisma", "build", "index.js");
const rrServeCliPath = path.join(__dirname, "node_modules", "@react-router", "serve", "bin.js");

// Fix EACCES (Permission Denied) errors for Prisma engine binaries on Linux hosting
const enginesDir = path.join(__dirname, "node_modules", "@prisma", "engines");
if (fs.existsSync(enginesDir)) {
  console.log("Setting execute permissions for Prisma engines...");
  try {
    const files = fs.readdirSync(enginesDir);
    for (const file of files) {
      const filePath = path.join(enginesDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile() && !file.endsWith(".js") && !file.endsWith(".json") && !file.endsWith(".md") && !file.endsWith(".ts")) {
        console.log(`Setting executable permissions (chmod +x) for engine: ${file}`);
        fs.chmodSync(filePath, 0o755);
      }
    }
  } catch (err) {
    console.error("Failed to set permissions on Prisma engines:", err);
  }
}

// Resolve database file path if using SQLite
let dbPath = path.join(__dirname, "prisma", "dev.sqlite");
if (process.env.DATABASE_URL.startsWith("file:")) {
  const relativePath = process.env.DATABASE_URL.replace("file:", "");
  dbPath = path.resolve(__dirname, relativePath);
}

function startServer() {
  console.log("Starting React Router server...");
  const server = spawn(nodePath, [rrServeCliPath, "./build/server/index.js"], {
    stdio: "inherit",
    env: process.env
  });

  server.on("exit", (srvCode) => {
    process.exit(srvCode);
  });
}

function runMigrations() {
  console.log("Running database setup and migrations...");
  const setup = spawn(nodePath, [prismaCliPath, "migrate", "deploy"], {
    stdio: "inherit",
    env: process.env
  });

  setup.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Prisma migrations failed with code ${code}. Attempting to start server anyway...`);
    } else {
      console.log("Database migrations completed successfully.");
    }
    startServer();
  });
}

// Check if database exists and is not empty (size > 0)
const dbExists = fs.existsSync(dbPath) && fs.statSync(dbPath).size > 0;

if (dbExists) {
  console.log("Database already exists and is initialized. Skipping migrations to optimize startup.");
  startServer();
} else {
  console.log("Database not found or uninitialized. Preparing migrations...");
  runMigrations();
}
