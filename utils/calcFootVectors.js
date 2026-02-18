// utils/footFromThighVectors.js

/*==============================================================================
                        ADD FOOT LANDMARKS
================================================================================
Adds foot landmarks (17, 18) based on hip->knee vectors for each leg and current
hip width. Tensorflow.js pose detection models do not include foot landmarks, 
but they can be estimated with the assumptions: 
- foot points in similar direction as thigh (ankle angle ~ - knee angle)
- when currentHipWidth < averageHipWidth, subject is likely turned to the side,
  so feet should point to the side more (xAdjust > 1). 
- when currentHipWidth > averageHipWidth, subject is likely facing forward, so 
  feet should point more downward (xAdjust < 1).
--------------------------------------------------------------------------------
INPUT:
- landmarksArray: landmarks[frame][index] === { x, y, score } (index 0-16)
- opts: {
    footLenRatio: foot length as ratio of shank length (default 0.5)
    yAdjust: multiplier to increase upward bias of foot direction (default 1.2)
    score: confidence score to assign to generated foot landmarks (default 0.9)
  }
OUTPUT: 
- landmarksArray: landmarks[frame][index] === { x, y, score } (index 0-18)

------------------------------------------------------------------------------*/
export function addFeetFromHipKneeVectors(landmarksArray, opts = {}) {
  const footLenRatio = opts.footLenRatio ?? 0.5;
  const yAdjust = opts.yAdjust ?? 1.2;
  const score = opts.score ?? 0.9;

  if (!Array.isArray(landmarksArray)) return landmarksArray;

  // Utility to normalize a vector
  const norm = (v) => {
    const m = Math.hypot(v.x, v.y);
    if (m < 1e-9) return { x: 0, y: 0 };
    return { x: v.x / m, y: v.y / m };
  };

  // Running average of hip width to smooth foot direction adjustments
  let accumulatedHipWidth = 0;

  // Process each frame of landmarks
  // Track global bounds across all frames so we can return a single cropped size
  let xMax = -Infinity, yMax = -Infinity, xMin = Infinity, yMin = Infinity;
  for (let i = 0; i < landmarksArray.length; i++) {
    const lm = landmarksArray[i];
    if (!Array.isArray(lm)) continue;

    // Per-frame temp bounds (used to compute this frame's points)
    let frameXMax = -Infinity, frameYMax = -Infinity, frameXMin = Infinity, frameYMin = Infinity;
    for (let j = 0; j < 17; j++) {
      if (!lm[j] || typeof lm[j].x !== 'number' || typeof lm[j].y !== 'number') {
        continue;
      } else {
        frameXMax = Math.max(frameXMax, lm[j].x);
        frameYMax = Math.max(frameYMax, lm[j].y);
        frameXMin = Math.min(frameXMin, lm[j].x);
        frameYMin = Math.min(frameYMin, lm[j].y);
      }

    }
    
    // Extract relevant landmarks
    const leftHip = lm[11];
    const rightHip = lm[12];
    const leftKnee = lm[13];
    const rightKnee = lm[14];
    const leftAnkle = lm[15];
    const rightAnkle = lm[16];

    // Ensure all required landmarks are present
    if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || 
        !rightAnkle) {
      continue;
    }
    
    // Calculate current hip width and update running average
    const currentHipWidth = Math.hypot(
      rightHip.x - leftHip.x, rightHip.y - leftHip.y
    );
    accumulatedHipWidth += currentHipWidth;
    const avgHipWidth = accumulatedHipWidth / (i + 1);
    // Calculate x adjustment factor based on hip width ratio
    // xAdjust > 1 (turned to side) => increase foot x direction ( < > ) 
    // xAdjust < 1 (facing forward) => decrease foot x direction ( V )
    const xAdjust = avgHipWidth / currentHipWidth;

    // hip->knee vectors (signed)
    const leftHipToKnee = {
      x: leftKnee.x - leftHip.x,
      y: leftKnee.y - leftHip.y,
    };
    const rightHipToKnee = {
      x: rightKnee.x - rightHip.x,
      y: rightKnee.y - rightHip.y,
    };

    // Adjust hip->knee vectors by xAdjust and yAdjust to bias foot direction
    const leftBiased = {
      x: leftHipToKnee.x * xAdjust,
      y: leftHipToKnee.y * yAdjust,
    };
    const rightBiased = {
      x: rightHipToKnee.x * xAdjust,
      y: rightHipToKnee.y * yAdjust,
    };

    // Normalize to get foot direction unit vectors
    const leftDir = norm(leftBiased);
    const rightDir = norm(rightBiased);

    // foot lengths from shank lengths for natural scale
    const leftShankLen = Math.hypot(leftAnkle.x - leftKnee.x, leftAnkle.y - leftKnee.y);
    const rightShankLen = Math.hypot(rightAnkle.x - rightKnee.x, rightAnkle.y - rightKnee.y);

    const leftFootLen = leftShankLen * footLenRatio;
    const rightFootLen = rightShankLen * footLenRatio;

    // ankle->foot follows adjusted hip->knee vector direction
    lm[17] = {
      x: leftAnkle.x + leftDir.x * leftFootLen,
      y: leftAnkle.y + leftDir.y * leftFootLen,
      score,
    };
    lm[18] = {
      x: rightAnkle.x + rightDir.x * rightFootLen,
      y: rightAnkle.y + rightDir.y * rightFootLen,
      score,
    };
    // Update global bounds with this frame's bounds and newly added foot points
    xMax = Math.max(xMax, frameXMax, lm[17].x, lm[18].x);
    yMax = Math.max(yMax, frameYMax, lm[17].y, lm[18].y);
    xMin = Math.min(xMin, frameXMin, lm[17].x, lm[18].x);
    yMin = Math.min(yMin, frameYMin, lm[17].y, lm[18].y);
  }

  const croppedWidth = (xMax - xMin) + (0.1 * (xMax - xMin)); 
  const croppedHeight = (yMax - yMin) + (0.1 * (yMax - yMin)); 
  return { landmarksArray, croppedWidth, croppedHeight };
}