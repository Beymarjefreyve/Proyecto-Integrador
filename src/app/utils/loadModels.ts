import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

export const loadModels = async (): Promise<void> => {
  if (modelsLoaded) return Promise.resolve();
  
  if (loadingPromise) return loadingPromise;

  const MODEL_URL = '/models';

  loadingPromise = Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
  ]).then(() => {
    modelsLoaded = true;
    console.log("Face API models loaded successfully");
  }).catch((err) => {
    console.error("Error loading Face API models:", err);
    throw err;
  });

  return loadingPromise;
};
