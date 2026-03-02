// Graceful Shutdown Module

import { pool } from './db.js';

let isShuttingDown = false;

/**
 * Setup graceful shutdown handlers
 */
export function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    if (isShuttingDown) {
      console.log('Shutdown already in progress...');
      return;
    }
    
    isShuttingDown = true;
    console.log(`\n${signal} received, starting graceful shutdown...`);
    
    try {
      // Close database connections
      console.log('Closing database connections...');
      await pool.end();
      console.log('Database connections closed');
      
      // Add other cleanup tasks here
      // - Close Redis connections
      // - Finish pending requests
      // - Save state
      
      console.log('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };
  
  // Handle termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
  
  console.log('Graceful shutdown handlers registered');
}

/**
 * Check if shutdown is in progress
 */
export function isShutdownInProgress() {
  return isShuttingDown;
}
