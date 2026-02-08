// utils/poseUtils.js

/* Smooth an array of pose landmarks over time using a moving average filter.
--------------------------------------------------------------------------------
   landmarksArray: Array of frames, each frame is an array of landmarks.
   windowSize: Size of the moving average window (must be odd).
   Returns a new array of smoothed landmarks.
------------------------------------------------------------------------------*/
export function smoothLandmarks(landmarksArray, windowSize = 5) {
    if (windowSize < 1) return landmarksArray;
    const halfWindow = Math.floor(windowSize / 2);
    const smoothed = [];

    /* Iterate over each frame
    --------------------------------------------------------------------------*/
    for (let i = 0; i < landmarksArray.length; i++) {
        const frame = [];
        const start = Math.max(0, i - halfWindow);
        const end = Math.min(landmarksArray.length - 1, i + halfWindow);

        /* Iterate over each landmark in the frame
        ----------------------------------------------------------------------*/
        for (let j = 0; j < landmarksArray[i].length; j++) {
            let sumX = 0, sumY = 0, sumZ = 0, count = 0;
            
            /* Accumulate landmarks within the window
            ------------------------------------------------------------------*/
            for (let k = start; k <= end; k++) {
                const lm = landmarksArray[k][j];            
                
                // Check if landmark exists and has valid x,y
                if ( lm && typeof lm.x === 'number' && typeof lm.y === 'number') { 
                    
                    // Accumulate x, y, and z if present
                    sumX += lm.x; 
                    sumY += lm.y;
                    if ('z' in lm && typeof lm.z === 'number') sumZ += lm.z;
                    count++;
                }
            }

            /* No valid landmarks found, set to NaN
            ----------------------------------------------------------------------*/
            if (count === 0) {
                frame.push({ x: NaN, y: NaN }); 

            /* Valid landmarks found, compute average
            ----------------------------------------------------------------------*/
            } else {
                const avgLandmark = {
                    x: sumX / count,
                    y: sumY / count
                };

                // Include z if original landmark had it
                const origLm = landmarksArray[i][j];
                if (origLm && 'z' in origLm && typeof origLm.z === 'number') {
                    avgLandmark.z = sumZ / count;
                }

                // Add averaged landmark to frame
                frame.push(avgLandmark);
            }
        }
        // Add smoothed frame to result
        smoothed.push(frame);
    }
    // Return array of smoothed frames
    return smoothed;
}

export function interpolateLandmarkFrames(frames, steps = 1) {
  if (!Array.isArray(frames) || frames.length < 2 || steps < 1) return frames;

  const out = [];
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    out.push(a); // keep original frame

    for (let s = 1; s <= steps; s++) {
      const t = s / (steps + 1);
      const interp = a.map((kpA, idx) => {
        const kpB = b[idx];
        if (!kpA || !kpB || kpA.x == null || kpB.x == null || kpA.y == null || kpB.y == null) {
          return { x: NaN, y: NaN };
        }
        const x = kpA.x + (kpB.x - kpA.x) * t;
        const y = kpA.y + (kpB.y - kpA.y) * t;
        const z =
          kpA.z != null && kpB.z != null
            ? kpA.z + (kpB.z - kpA.z) * t
            : undefined;
        return z == null ? { x, y } : { x, y, z };
      });
      out.push(interp);
    }
  }
  // push last frame
  out.push(frames[frames.length - 1]);
  return out;
}

// Optionally combine smoothing + interpolation:
export function smoothAndInterpolateLandmarks(frames, smoothWindow = 5, steps = 1) {
  const smoothed = smoothLandmarks(frames, smoothWindow);
  return interpolateLandmarkFrames(smoothed, steps);
}

/* Scale landmarks from original dimensions to target dimensions
--------------------------------------------------------------------------------
landmarks: Array of landmarks to scale.
original: { width, height } of the original video.
target: { width, height } of the target canvas.
Returns a new array of scaled landmarks.
------------------------------------------------------------------------------*/
export function scaleLandmarks(landmarks, original, target) {
  if (!landmarks || !Array.isArray(landmarks)) return [];
  const { width: origW, height: origH } = original;
  const { width: targetW, height: targetH } = target;
  return landmarks.map(kp =>
    kp && kp.x != null && kp.y != null
      ? {
          ...kp,
          x: (kp.x / origW) * targetW,
          y: (kp.y / origH) * targetH,
        }
      : kp
  );
}

/* Scale an array of landmark frames from original dimensions to target dimensions
--------------------------------------------------------------------------------
frames: Array of frames, each frame is an array of landmarks.
original: { width, height } of the original video.
target: { width, height } of the target canvas.
Returns a new array of frames with scaled landmarks.
------------------------------------------------------------------------------*/
export function scaleLandmarkFrames(frames, original, target) {
  return frames.map(frame => scaleLandmarks(frame, original, target));
}