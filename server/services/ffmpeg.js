const ffmpeg = require('fluent-ffmpeg');
const logger = require('./logger');
const path = require('path');

function convertToFormat(inputPath, outputPath, format, onProgress) {
  let command;
  
  const promise = new Promise((resolve, reject) => {
    // Validate format vs extension
    const extension = path.extname(outputPath).toLowerCase().replace('.', '');
    if (extension !== format.toLowerCase()) {
      return reject(new Error(`Security Error: Output extension mismatch for format: ${format}`));
    }
    
    // Set FFmpeg executable path for Node.js process
    const ffmpegPath = require('ffmpeg-static');
    
    command = ffmpeg(inputPath)
      .setFfmpegPath(ffmpegPath)
      .timeout(900)
      .native()
      .on('progress', (progress) => {
        if (onProgress && progress.percent) {
          onProgress(progress.percent);
        }
      })
      .on('error', (err) => {
        logger.error('FFmpeg conversion error:', err);
        reject(err);
      })
      .on('end', () => {
        logger.info('FFmpeg conversion complete:', outputPath);
        resolve(outputPath);
      });

    // Configure output based on format
    if (format === 'mp3') {
      command.noVideo().audioCodec('libmp3lame').audioBitrate('192k');
    } else if (format === 'wav') {
      command.noVideo().audioCodec('pcm_s16le');
    } else if (format === 'aac') {
      command.noVideo().audioCodec('aac').audioBitrate('192k');
    } else if (format === 'flac') {
      command.noVideo().audioCodec('flac');
    } else if (format === 'm4a') {
      command.noVideo().audioCodec('aac').format('m4a').audioBitrate('192k');
    } else if (format === 'mp4') {
      command.videoCodec('libx264').audioCodec('aac').videoBitrate('1000k');
    } else if (format === 'mov') {
      command.videoCodec('libx264').audioCodec('aac').format('mov');
    } else if (format === 'mkv') {
      command.videoCodec('libx264').audioCodec('aac').format('matroska');
    } else if (format === 'avi') {
      command.videoCodec('libx264').audioCodec('aac').format('avi');
    } else {
      command.videoCodec('libx264').audioCodec('aac').videoBitrate('1000k');
    }

    command.saveToFile(outputPath);
  });

  return {
    promise,
    kill: () => {
      if (command) {
        command.kill('SIGKILL');
      }
    }
  };
}

module.exports = {
  convertToFormat
};
