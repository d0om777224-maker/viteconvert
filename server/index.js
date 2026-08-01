const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { downloadVideo } = require('./services/youtube');
const { convertToFormat } = require('./services/ffmpeg');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;

const jobs = {};


// Start conversion
app.post('/api/convert', (req, res) => {
  console.log("Conversion request:", req.body);
  let { url, format = 'mp4', quality = 'best' } = req.body;

  if (format === 'mp3') {
    quality = 'audio';
  }

  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }

  const jobId = uuidv4();

  jobs[jobId] = {
    id: jobId,
    url,
    format,
    quality,
    progress: 0,
    status: 'Starting...',
    complete: false,
    error: null,
    filePath: null,
    originalFilePath: null
  };

  processJob(jobId);

  res.json({ jobId });
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
      jobId: job.id
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

  console.log("Sending file:", job.filePath);

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


    console.log(`Job ${jobId} finished: ${outputFilePath}`);


    // Cleanup after 10 minutes
    setTimeout(() => {
      try {
        if (job.filePath && fs.existsSync(job.filePath)) {
          fs.unlinkSync(job.filePath);
          console.log(`Deleted converted file: ${job.filePath}`);
        }

        if (job.originalFilePath && fs.existsSync(job.originalFilePath)) {
          fs.unlinkSync(job.originalFilePath);
          console.log(`Deleted original file: ${job.originalFilePath}`);
        }

        delete jobs[jobId];
        console.log(`Cleaned up job: ${jobId}`);
      } catch (err) {
        console.error("Cleanup error:", err.message);
      }
    }, 10 * 60 * 1000);


  } catch (error) {

    console.error(`Job ${jobId} failed:`, error);

    job.error = error.message;
    job.status = 'Error';
  }
}


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});