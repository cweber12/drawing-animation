// utils/footFromThighVectors.js

/**
 * Adds feet landmarks (17 left foot, 18 right foot) by matching ankle->foot vectors
 * to hip->knee vectors (signed direction/magnitude trend), with optional upward toe bias.
 *
 * Landmark indices expected:
 * 11 leftHip, 12 rightHip, 13 leftKnee, 14 rightKnee, 15 leftAnkle, 16 rightAnkle
 * Writes:
 * 17 leftFoot, 18 rightFoot
 *
 * @param {Array<Array<{x:number,y:number,score?:number}>>} landmarksArray
 * @param {Object} [opts]
 * @param {number} [opts.footLenRatio=0.5] - foot length = shank length * ratio
 * @param {number} [opts.yUpPadding=10] - upward bias in px applied before normalize
 * @param {number} [opts.score=0.9] - score for synthesized foot landmarks
 * @returns {Array<Array<{x:number,y:number,score?:number}>>}
 */
export function addFeetFromHipKneeVectors(landmarksArray, opts = {}) {
  const footLenRatio = opts.footLenRatio ?? 0.5;
  const yUpPadding = opts.yUpPadding ?? 54;
  const score = opts.score ?? 0.9;

  if (!Array.isArray(landmarksArray)) return landmarksArray;

  const norm = (v) => {
    const m = Math.hypot(v.x, v.y);
    if (m < 1e-9) return { x: 0, y: 0 };
    return { x: v.x / m, y: v.y / m };
  };

  for (let i = 0; i < landmarksArray.length; i++) {
    const lm = landmarksArray[i];
    if (!Array.isArray(lm)) continue;

    const leftHip = lm[11];
    const rightHip = lm[12];
    const leftKnee = lm[13];
    const rightKnee = lm[14];
    const leftAnkle = lm[15];
    const rightAnkle = lm[16];

    if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
      continue;
    }

    // hip->knee vectors (signed)
    const leftHipToKnee = {
      x: leftKnee.x - leftHip.x,
      y: leftKnee.y - leftHip.y,
    };
    const rightHipToKnee = {
      x: rightKnee.x - rightHip.x,
      y: rightKnee.y - rightHip.y,
    };

    // add upward toe bias (screen y grows downward, so subtract to angle upward)
    const leftBiased = {
      x: leftHipToKnee.x,
      y: leftHipToKnee.y - yUpPadding,
    };
    const rightBiased = {
      x: rightHipToKnee.x,
      y: rightHipToKnee.y - yUpPadding,
    };

    const leftDir = norm(leftBiased);
    const rightDir = norm(rightBiased);

    // foot lengths from shank lengths for natural scale
    const leftShankLen = Math.hypot(leftAnkle.x - leftKnee.x, leftAnkle.y - leftKnee.y);
    const rightShankLen = Math.hypot(rightAnkle.x - rightKnee.x, rightAnkle.y - rightKnee.y);

    const leftFootLen = leftShankLen * footLenRatio;
    const rightFootLen = rightShankLen * footLenRatio;

    // ankle->foot follows hip->knee vector direction
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
  }

  return landmarksArray;
}