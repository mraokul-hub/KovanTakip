// varroa-model-loader.js
// Loads the TensorFlow.js model from CDN lazily and caches the instance.
// Uses a singleton pattern to ensure the model is loaded only once.

// CDN URL – replace with your actual model location when available.
const MODEL_CDN_URL = 'https://cdn.jsdelivr.net/gh/yourrepo/varroa-model/model.json';

let modelPromise = null;

/**
 * Returns a promise that resolves to the loaded TensorFlow.js GraphModel.
 * The model is loaded only on the first call; subsequent calls reuse the same instance.
 */
export async function getVarroaModel() {
    if (!modelPromise) {
        // Dynamically import TensorFlow.js only when needed to reduce initial bundle size.
        const tf = await import('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.4.0/dist/tf.min.js');
        // Load the model from CDN (or fallback to local path if CDN fails).
        modelPromise = tf.loadGraphModel(MODEL_CDN_URL).catch(async (err) => {
            console.warn('Failed to load model from CDN, attempting local fallback:', err);
            // Local fallback – assumes model files are placed under /models/ folder.
            const localUrl = '/models/model.json';
            return tf.loadGraphModel(localUrl);
        });
    }
    return modelPromise;
}

/**
 * Helper to warm‑up the model (run a dummy inference) so that the first real call is faster.
 */
export async function warmupVarroaModel() {
    const model = await getVarroaModel();
    // Create a dummy tensor with the expected input shape (1, 416, 416, 3).
    const dummy = tf.zeros([1, 416, 416, 3]);
    await model.executeAsync(dummy);
    dummy.dispose();
}
