const fs = require('fs');
const logger = require('./logger');
const path = require('path');

/**
 * Deletes temporary and converted files for a specific job.
 * @param {Object} job - The job object containing file paths.
 */
function cleanupJobFiles(job) {
  // Update lastAccessTime to prevent race conditions during cleanup
  job.lastAccess = Date.now();
  
  const filesToDelete = [job.filePath, job.originalFilePath];

  filesToDelete.forEach((filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        logger.info(`Deleted file: ${filePath}`);
      } catch (err) {
        logger.error(`Error deleting file ${filePath}: ${err.message}`);
      }
    }
  });
}

/**
 * Performs startup cleanup of the temp directory.
 */
function performStartupCleanup() {
  const tempDir = path.join(__dirname, '../temp');
  
  if (!fs.existsSync(tempDir)) return;

  logger.info('Performing startup cleanup of temp directory...');
  
  fs.readdirSync(tempDir).forEach((file) => {
    const filePath = path.join(tempDir, file);
    try {
      // Only delete files, ignore directories if any
      if (fs.lstatSync(filePath).isFile() && file !== '.gitkeep') {
        fs.unlinkSync(filePath);
        logger.info(`Cleaned up stale file: ${file}`);
      }
    } catch (err) {
      logger.error(`Error deleting stale file ${file}: ${err.message}`);
    }
  });
}

module.exports = { cleanupJobFiles, performStartupCleanup };
