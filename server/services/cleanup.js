const fs = require('fs');
const logger = require('./logger');

/**
 * Deletes temporary and converted files for a specific job.
 * @param {Object} job - The job object containing file paths.
 */
function cleanupJobFiles(job) {
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

module.exports = { cleanupJobFiles };
