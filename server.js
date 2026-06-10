import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure DATABASE_URL is set for runtime
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./prisma/dev.sqlite";
}

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
        fs.chmodSync(filePath, 0o755);
      }
    }
    console.log("Prisma engine permissions set successfully.");
  } catch (err) {
    console.error("Failed to set permissions on Prisma engines:", err);
  }
}

// Set the required argument for the React Router Serve CLI
process.argv[2] = "./build/server/index.js";

// Run the React Router server directly in the main parent process.
// This allows Hostinger (Phusion Passenger) to intercept the server listen port correctly
// and prevents 503 Service Unavailable errors caused by spawning child processes.
console.log("Starting React Router server in-process...");
const cliPath = path.join(__dirname, "node_modules", "@react-router", "serve", "dist", "cli.js");
import(pathToFileURL(cliPath).href);
