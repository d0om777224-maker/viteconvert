const queue = [];
let isProcessing = false;

/**
 * Returns the position of a job in the queue (1-indexed).
 * Returns -1 if not found.
 */
function getQueuePosition(jobId) {
  const index = queue.indexOf(jobId);
  return index === -1 ? -1 : index + 1;
}

/**
 * Adds a job ID to the queue and triggers processing.
 */
function addToQueue(jobId, processCallback) {
  queue.push(jobId);
  processNext(processCallback);
}
// ...
/**
 * Checks if we can process the next job in the queue.
 */
async function processNext(processCallback) {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const jobId = queue.shift();

  try {
    await processCallback(jobId);
  } catch (err) {
    console.error(`Error processing job ${jobId} from queue:`, err);
  } finally {
    isProcessing = false;
    processNext(processCallback);
  }
}

module.exports = { addToQueue, getQueuePosition };
