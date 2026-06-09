import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the absolute path to the current Node executable running this script
const nodePath = process.execPath;
const prismaCliPath = path.join(__dirname, "node_modules", "prisma", "build", "index.js");
const rrServeCliPath = path.join(__dirname, "node_modules", "@react-router", "serve", "bin.js");

console.log("Running database setup and migrations...");
// Run migrations on start to ensure tables exist in database
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
  
  console.log("Starting React Router server...");
  const server = spawn(nodePath, [rrServeCliPath, "./build/server/index.js"], {
    stdio: "inherit",
    env: process.env
  });

  server.on("exit", (srvCode) => {
    process.exit(srvCode);
  });
});
