const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;

// Define a single format for log lines
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    // Write all logs to console
    new transports.Console({ format: combine(colorize(), logFormat) }),
    
    // Write all logs to a file
    new transports.File({ filename: 'server/logs/error.log', level: 'error' }),
    new transports.File({ filename: 'server/logs/combined.log' }),
  ],
});

// Ensure logs directory exists
const fs = require('fs');
const dir = './logs';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

module.exports = logger;
