import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';

// Handle Uncaught Exceptions (Synchronous errors that weren't caught)
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down gracefully...');
  console.error(error.name, error.message, error.stack);
  process.exit(1);
});

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  console.log(`📡 Health Check available at http://localhost:${env.PORT}/health`);
});

// Handle Unhandled Rejections (Asynchronous promises that rejected but weren't caught)
process.on('unhandledRejection', (reason) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down gracefully...');
  console.error(reason);
  // Close the server first, then exit
  server.close(() => {
    process.exit(1);
  });
});

// Graceful Shutdown on System signals (e.g. from Kubernetes, Docker, Azure App Service)
const gracefulShutdown = (signal: string) => {
  console.log(`🛑 Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('✔ HTTP server closed.');

    try {
      await prisma.$disconnect();
      console.log('✔ Database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during database disconnection:', err);
      process.exit(1);
    }
  });

  // Force close after 10s if shutdown hangs
  setTimeout(() => {
    console.error('❌ Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
