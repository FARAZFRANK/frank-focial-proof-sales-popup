import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodePath = process.execPath;
const prismaCliPath = path.join(__dirname, "node_modules", "prisma", "build", "index.js");
const rrServeCliPath = path.join(__dirname, "node_modules", "@react-router", "serve", "bin.js");
const dbPath = path.join(__dirname, "prisma", "dev.sqlite");

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

// Optimization: If the SQLite database file already exists, bypass the migration process
// to save memory and CPU on Hostinger, preventing restarts.
if (fs.existsSync(dbPath)) {
  console.log("Database already exists. Skipping migrations to optimize startup.");
  startServer();
} else {
  runMigrations();
}
