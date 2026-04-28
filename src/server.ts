import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import app from "./app";
import config from "./config";
import { SocketHelper } from "./helpers/socketHelper";

let server: HttpServer;

async function main() {
  try {
    // Start HTTP server
    server = app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });

    // Initialize Socket.io
    const io = new SocketServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Pass io to SocketHelper
    SocketHelper.socket(io);

    // Make io accessible globally if needed, or use a helper to emit from controllers
    (global as any).io = io;

    // Handle server errors
    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${config.port} is already in use`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

main();
