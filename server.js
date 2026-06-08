import { spawn } from "child_process";

console.log("Running database setup and migrations...");
// Run migrations on start to ensure tables exist in database
const setup = spawn("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: process.env
});

setup.on("exit", (code) => {
  if (code !== 0) {
    console.error(`Prisma migrations failed with code ${code}. Attempting to start server anyway...`);
  } else {
    console.log("Database migrations completed successfully.");
  }
  
  console.log("Starting React Router server...");
  const server = spawn("npx", ["react-router-serve", "./build/server/index.js"], {
    stdio: "inherit",
    shell: true,
    env: process.env
  });

  server.on("exit", (srvCode) => {
    process.exit(srvCode);
  });
});
