const ffmpeg = require('fluent-ffmpeg');
const logger = require('./logger');

function convertToFormat(inputPath, outputPath, format, onProgress) {
  return new Promise((resolve, reject) => {
    let progressReported = false;
    
    // Set FFmpeg executable path for Node.js process
    const ffmpegPath = require('ffmpeg-static');
    
    const command = ffmpeg(inputPath)
      .on('progress', (progress) => {
        logger.info(`FFmpeg progress: ${JSON.stringify(progress)}`);
        if (onProgress && progress.percent) {
          onProgress(progress.percent);
        }
      })
      .on('error', (err) => {
        console.error('FFmpeg conversion error:', err);
        reject(err);
      })
      .on('end', () => {
        console.log('FFmpeg conversion complete:', outputPath);
        resolve(outputPath);
      });

    // Configure output based on format
    if (format === 'mp3') {
      command
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('192k')
        .saveToFile(outputPath);
    } else {
      // Default to MP4 video format
      command
        .videoCodec('libx264')
        .audioCodec('aac')
        .videoBitrate('1000k')
        .saveToFile(outputPath);
    }
  });
}

module.exports = {
  convertToFormat
};
