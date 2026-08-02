const { exec, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const logger = require('./logger');

const ytDlpPath = "yt-dlp";

// Safe path joining with validation
function safeJoin(basePath, subPath) {
  const normalizedPath = path.normalize(subPath);
  if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
    throw new Error('Invalid path: Attempted directory traversal');
  }
  return path.join(basePath, normalizedPath);
}

function getDuration(url) {
  return new Promise((resolve, reject) => {
    // Use --print duration for a clean integer result
    exec(`${ytDlpPath} --print duration "${url}"`, (err, stdout, stderr) => {
      if (err) {
        logger.error(`yt-dlp duration check failed: ${stderr}`);
        return reject(new Error("Could not validate video duration."));
      }
      
      const seconds = parseInt(stdout.trim(), 10);
      if (isNaN(seconds)) {
        logger.error(`yt-dlp returned non-numeric duration: ${stdout}`);
        return reject(new Error("Could not parse video duration."));
      }
      
      resolve(seconds);
    });
  });
}

function getFormat(quality) {
  switch (quality) {
    case "1080":
      return "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]";
    case "720":
      return "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]";
    case "480":
      return "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]";
    case "audio":
      return "bestaudio[ext=m4a]/bestaudio";
    default:
      return "best[ext=mp4]/best";
  }
}

function downloadVideo(url, jobId, quality, onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      const duration = await getDuration(url);
      if (duration > 7200) {
        return reject(new Error("Video is too long. Maximum supported duration is 2 hours."));
      }
    } catch (err) {
      return reject(new Error("Could not validate video duration."));
    }

    const tempDir = path.join(__dirname, "../temp");

    // Make sure temp folder exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const downloadedFilePath = safeJoin(
      tempDir,
      `${jobId}.%(ext)s`
    );

    const process = spawn(ytDlpPath, [
      "-f",
      getFormat(quality),
      "--no-playlist",
      "--newline",
      "--progress",
      "--progress-template",
      "download:[%(progress.downloaded_bytes)s/%(progress.total_bytes)s] %(progress._percent_str)s",
      "-o",
      downloadedFilePath,
      url
    ]);


    process.stdout.on("data", (data) => {
      const output = data.toString();

      logger.info(`yt-dlp: ${output}`);

      const match = output.match(/(\d+\.\d+)%/);

      if (match && onProgress) {
        onProgress(parseFloat(match[1]));
      }
    });


    process.stderr.on("data", (data) => {
      logger.error(`yt-dlp error: ${data.toString()}`);
    });


    process.on("error", (err) => {
      reject(err);
    });


    process.on("close", (code) => {

      if (code !== 0) {
        reject(new Error(`yt-dlp exited with code ${code}`));
        return;
      }


      const files = fs.readdirSync(tempDir);

      const downloadedFile = files.find(
        (file) =>
          file.startsWith(jobId) &&
          file !== `${jobId}.%(ext)s`
      );


      if (downloadedFile) {

        resolve(
          path.join(tempDir, downloadedFile)
        );

      } else {

        const fallbackFile = files.find(
          (file) => file.includes(jobId)
        );


        if (fallbackFile) {

          resolve(
            path.join(tempDir, fallbackFile)
          );

        } else {

          reject(
            new Error("No downloaded file found")
          );

        }
      }
    });

  });
}


module.exports = {
  downloadVideo
};