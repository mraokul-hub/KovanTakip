// varroa-detector.js
// Preprocesses an image, runs inference with TensorFlow.js model, and returns filtered detections.

import { getVarroaModel } from './varroa-model-loader.js';

/**
 * Configuration thresholds for filtering detections.
 * Adjust these values to reduce false positives.
 */
const MIN_CONFIDENCE = 0.6; // Minimum model confidence to accept a detection
const MIN_AREA = 900; // Minimum pixel area (e.g., 30x30) to consider a valid mite

/**
 * Resize image to target size (416x416) and normalize pixel values to [0,1].
 * Returns a tf.Tensor4D of shape [1, 416, 416, 3].
 */
async function preprocessImage(imageElement) {
  const tf = await import('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.4.0/dist/tf.min.js');
  const canvas = document.createElement('canvas');
  const TARGET = 416;
  canvas.width = TARGET;
  canvas.height = TARGET;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0, TARGET, TARGET);
  const imgData = ctx.getImageData(0, 0, TARGET, TARGET);
  const data = tf.browser.fromPixels(imgData).toFloat().div(255.0);
  return data.expandDims(0); // [1, h, w, 3]
}

/**
 * Compute Intersection over Union (IoU) between two boxes.
 */
function iou(boxA, boxB) {
  const xA = Math.max(boxA.x, boxB.x);
  const yA = Math.max(boxA.y, boxB.y);
  const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);
  const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const boxAArea = boxA.width * boxA.height;
  const boxBArea = boxB.width * boxB.height;
  return interArea / (boxAArea + boxBArea - interArea);
}

/**
 * Perform Non‑Maximum Suppression (NMS) on detections.
 */
function nonMaxSuppression(detections, iouThreshold = 0.5) {
  const sorted = detections.slice().sort((a, b) => b.score - a.score);
  const keep = [];
  while (sorted.length) {
    const current = sorted.shift();
    keep.push(current);
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (iou(current, sorted[i]) > iouThreshold) {
        sorted.splice(i, 1);
      }
    }
  }
  return keep;
}

/**
 * Runs inference and parses YOLO‑style output.
 * Returns filtered detections after applying confidence, area, and NMS filters.
 */
export async function detectVarroaInImage(imageElement) {
  const model = await getVarroaModel();
  const inputTensor = await preprocessImage(imageElement);
  const output = await model.executeAsync(inputTensor);
  const detections = await output.array();
  inputTensor.dispose();
  output.dispose();

  const filtered = detections[0]
    .filter(d => d[4] >= MIN_CONFIDENCE)
    .map(d => ({
      x: (d[0] - d[2] / 2) * imageElement.naturalWidth,
      y: (d[1] - d[3] / 2) * imageElement.naturalHeight,
      width: d[2] * imageElement.naturalWidth,
      height: d[3] * imageElement.naturalHeight,
      score: d[4],
      classId: d[5]
    }))
    .filter(det => det.width * det.height >= MIN_AREA);

  return nonMaxSuppression(filtered, 0.5);
}
