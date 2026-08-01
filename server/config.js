module.exports = {
  PORT: process.env.PORT || 3001,
  TEMP_DIR: process.env.TEMP_DIR || './temp',
  MAX_DURATION: 7200, // seconds
  CLEANUP_DELAY_MS: 10 * 60 * 1000, // 10 minutes
};
