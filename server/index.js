const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { downloadVideo } = require('./services/youtube');
const { convertToFormat } = require('./services/ffmpeg');
const { cleanupJobFiles } = require('./services/cleanup');
const { addToQueue, getQueuePosition } = require('./services/queue');
const config = require('./config');
const logger = require('./services/logger');

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"]
    }
  }
}));

// Enhanced CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-ID']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));

const PORT = config.PORT;

const jobs = {};


// Enhanced validation functions
const validationUtils = {
  // Strict URL validation
  validateYouTubeUrl: (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
    if (!youtubeRegex.test(url)) {
      throw new Error('Invalid YouTube URL format');
    }
    
    // Path traversal prevention
    if (url.includes('..') || 
        (url.includes('?') && !url.includes('youtube.com/watch')) ||
        url.includes('#')) {
      throw new Error('URL contains potentially malicious characters');
    }
    
    // URL length check
    if (url.length > 2048) {
      throw new Error('URL too long');
    }
    
    // Character encoding check
    try {
      decodeURIComponent(url);
    } catch (e) {
      throw new Error('Invalid URL encoding');
    }
    
    return url;
  },
  
  // Safe file path validation
  safePath: (basePath, subPath) => {
    const path = require('path');
    
    // Normalize and resolve path
    const normalized = path.normalize(subPath);
    
    // Prevent directory traversal
    if (normalized.startsWith('..') || 
        path.isAbsolute(normalized) ||
        normalized.includes('\\')) {
      throw new Error('Invalid path: Directory traversal attempt detected');
    }
    
    return path.join(basePath, normalized);
  },
  
  // Sanitize job ID
  validateJobId: (jobId) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      throw new Error('Invalid job ID format');
    }
    return jobId;
  }
};

// Start conversion
app.post('/api/convert', (req, res) => {
  try {
    const validatedUrl = validationUtils.validateYouTubeUrl(req.body.url);
    logger.info("Conversion request:", req.body);
    let { url = validatedUrl, format = 'mp4', quality = 'best' } = req.body;

    if (format === 'mp3') {
      quality = 'audio';
    }

    const jobId = uuidv4();

    jobs[jobId] = {
      id: jobId,
      url: validatedUrl,
      format,
      quality,
      progress: 0,
      status: 'Queued...',
      complete: false,
      error: null,
      filePath: null,
      originalFilePath: null
    };

    addToQueue(jobId, processJob);

  res.json({ jobId });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});


// SSE progress
app.get('/api/progress/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders();

  const sendUpdate = () => {
    const data = {
      progress: job.progress,
      status: job.status,
      complete: job.complete,
      error: job.error,
      jobId: job.id,
      queuePosition: getQueuePosition(jobId)
    };

    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendUpdate();

  const interval = setInterval(() => {
    sendUpdate();

    if (job.complete || job.error) {
      clearInterval(interval);

      setTimeout(() => {
        res.end();
      }, 500);
    }

  }, 1000);


  req.on('close', () => {
    clearInterval(interval);
  });
});


// Download file
app.get('/api/download/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];

  if (!job || !job.complete || !job.filePath) {
    return res.status(404).json({ error: 'File not ready' });
  }

  logger.info("Sending file:", job.filePath);

  res.download(
    job.filePath,
    path.basename(job.filePath)
  );
});


// Processing pipeline
async function processJob(jobId) {
  const job = jobs[jobId];

  if (!job) return;

  try {

    job.status = 'Downloading...';


    const downloadedFilePath = await downloadVideo(
      job.url,
      jobId,
      job.quality,
      (progress) => {

        job.progress = Math.round(progress * 0.75);
        job.status = `Downloading: ${job.progress}%`;
      }
    );


    job.originalFilePath = downloadedFilePath;


    const outputFilePath = path.join(
      path.dirname(downloadedFilePath),
      `${jobId}_converted.${job.format}`
    );


    job.status = 'Converting...';


    await convertToFormat(
      downloadedFilePath,
      outputFilePath,
      job.format,
      (progress) => {

        job.progress = Math.min(
          100,
          Math.round(75 + progress * 0.25)
        );

        job.status = `Converting: ${job.progress}%`;
      }
    );


    job.filePath = outputFilePath;
    job.progress = 100;
    job.status = 'Complete!';
    job.complete = true;


    logger.info(`Job ${jobId} finished: ${outputFilePath}`);


    // Cleanup after 10 minutes
    setTimeout(() => {
      cleanupJobFiles(job);
      delete jobs[jobId];
      logger.info(`Cleaned up job: ${jobId}`);
    }, config.CLEANUP_DELAY_MS);


  } catch (error) {

    logger.error(`Job ${jobId} failed:`, error);

    job.error = error.message;
    job.status = 'Error';
    
    // Cleanup on failure
    cleanupJobFiles(job);
    delete jobs[jobId];
  }
}


app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});