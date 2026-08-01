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
module.exports = { addToQueue, getQueuePosition };
