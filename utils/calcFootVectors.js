// utils/footFromThighVectors.js

/*==============================================================================
                        ADD FOOT LANDMARKS
================================================================================
Adds foot landmarks (17, 18) based on leg vectors and current hip width.
Tensorflow.js pose detection models do not include foot landmarks, so we
estimate them.

Key goals in this version:
1) Reduce jerky foot motion via smoothing (dir + position + xAdjust clamp/EMA).
2) Add optional 3D foreshortening so foot length shortens as avgTorsoWidth grows.
3) Make "toward hips" bias rotation-safe:
   - Avoid global Y-axis hacks (breaks if upside down / flips / rotated camera).
   - Instead, bias ankle->foot direction toward ankle->hip direction.
     When upright: ankle->hip points up. Upside-down: it points down. Still correct.

--------------------------------------------------------------------------------
INPUT:
- landmarksArray: landmarks[frame][index] === { x, y, score } (index 0-16)
- opts: {
    footLenRatio: foot length as ratio of shank length (default 0.5)
    score: confidence score to assign to generated foot landmarks (default 0.9)

    // Smoothing options
    hipWidthEmaK: EMA gain for hip width running average (default 0.08)
    xAdjustClamp: clamp range for xAdjust (default [0.75, 1.5])
    xAdjustEmaK: EMA gain for xAdjust smoothing (default 0.15)
    dirAlphaBase: base lerp alpha for direction smoothing (default 0.25)
    dirAlphaMin: minimum alpha when direction changes a lot (default 0.08)
    dirAlphaMax: maximum alpha when direction changes a little (default 0.45)
    maxDirDeltaRad: max radians direction can rotate per frame (default 0.30)
    posBeta: lerp beta for foot point position smoothing (default 0.35)

    minPartScore: if any required landmark score < this, reuse previous (default 0.2)
    allowReuseOnLowScore: reuse previous feet when confidence low (default true)

    // Foreshortening based on avgTorsoWidth (optional)
    avgTorsoWidth: number OR number[] (per-frame) OR function(i)->number
    torsoWidthRefMode: "hip" | "emaMax" | "custom" (default "hip")
    torsoWidthRef: number (only if "custom")
    torsoWidthEmaK: EMA gain for torso width smoothing (default 0.12)
    maxFootShorten: maximum shortening fraction at full forward (default 0.15)
    foreshortenEase: "smoothstep" | "quadratic" | "linear" (default "smoothstep")

    // NEW: Rotation-safe bias to pull foot direction toward hips
    // 0 = no pull (use thigh-derived direction)
    // 1 = foot points directly toward hip
    hipPullStrength: number (default 0.55)  // more drastic toward hips
    hipPullEmaK: number (default 0.15)      // smooth the pull factor
  }

OUTPUT:
- { landmarksArray, croppedWidth, croppedHeight }
------------------------------------------------------------------------------*/

export function addFeetFromHipKneeVectors(landmarksArray, opts = {}) {
  const footLenRatio = opts.footLenRatio ?? 0.5;
  const score = opts.score ?? 0.9;

  // Smoothing options
  const hipWidthEmaK = opts.hipWidthEmaK ?? 0.08;

  const xAdjustClamp = opts.xAdjustClamp ?? [0.75, 1.5];
  const xAdjustEmaK = opts.xAdjustEmaK ?? 0.15;

  const dirAlphaBase = opts.dirAlphaBase ?? 0.25;
  const dirAlphaMin = opts.dirAlphaMin ?? 0.08;
  const dirAlphaMax = opts.dirAlphaMax ?? 0.45;
  const maxDirDeltaRad = opts.maxDirDeltaRad ?? 0.30; // ~17 degrees per frame

  const posBeta = opts.posBeta ?? 0.35;

  const minPartScore = opts.minPartScore ?? 0.2;
  const allowReuseOnLowScore = opts.allowReuseOnLowScore ?? true;

  // Foreshortening options
  const avgTorsoWidthOpt = opts.avgTorsoWidth; // optional
  const torsoWidthRefMode = opts.torsoWidthRefMode ?? "hip";
  const torsoWidthRef = opts.torsoWidthRef; // used if custom
  const torsoWidthEmaK = opts.torsoWidthEmaK ?? 0.12;
  const maxFootShorten = opts.maxFootShorten ?? 0.15; // 15% max shortening
  const foreshortenEase = opts.foreshortenEase ?? "smoothstep";

  // NEW: hip pull options (rotation-safe "toward hips" bias)
  const hipPullStrength = opts.hipPullStrength ?? 0.35; // more drastic by default
  const hipPullEmaK = opts.hipPullEmaK ?? 0.15;

  if (!Array.isArray(landmarksArray)) return landmarksArray;

  // ---------------------------
  // Utility helpers
  // ---------------------------
  const EPS = 1e-6;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const lerp = (a, b, t) => a + (b - a) * t;

  const lerpPt = (p0, p1, t) => ({ x: lerp(p0.x, p1.x, t), y: lerp(p0.y, p1.y, t) });

  const mag = (v) => Math.hypot(v.x, v.y);

  const norm = (v) => {
    const m = mag(v);
    if (m < 1e-9) return { x: 0, y: 0 };
    return { x: v.x / m, y: v.y / m };
  };

  const dot = (a, b) => a.x * b.x + a.y * b.y;

  const angleBetween = (a, b) => {
    const d = clamp(dot(a, b), -1, 1);
    return Math.acos(d);
  };

  const rotate = (v, rad) => {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
  };

  const signedAngle = (from, to) => {
    const cross = from.x * to.y - from.y * to.x;
    const d = clamp(dot(from, to), -1, 1);
    return Math.atan2(cross, d);
  };

  const limitDirTurn = (prevDir, curDir, maxDelta) => {
    if (!prevDir) return curDir;
    const delta = signedAngle(prevDir, curDir);
    const ad = Math.abs(delta);
    if (ad <= maxDelta) return curDir;
    const step = Math.sign(delta) * maxDelta;
    return norm(rotate(prevDir, step));
  };

  const getScore = (p) => (p && typeof p.score === "number" ? p.score : 1);

  const hasXY = (p) => p && typeof p.x === "number" && typeof p.y === "number";

  const safeDirAlpha = (prevDir, curDir) => {
    if (!prevDir) return dirAlphaBase;
    const a = angleBetween(prevDir, curDir); // [0..pi]
    const t = clamp(a / 0.6, 0, 1);
    return clamp(lerp(dirAlphaMax, dirAlphaMin, t), dirAlphaMin, dirAlphaMax);
  };

  const ease01 = (x) => {
    const t = clamp(x, 0, 1);
    if (foreshortenEase === "quadratic") return t * t;
    if (foreshortenEase === "linear") return t;
    return t * t * (3 - 2 * t); // smoothstep
  };

  const getAvgTorsoWidthForFrame = (i) => {
    if (avgTorsoWidthOpt == null) return null;
    if (typeof avgTorsoWidthOpt === "function") {
      const v = avgTorsoWidthOpt(i);
      return Number.isFinite(v) ? v : null;
    }
    if (Array.isArray(avgTorsoWidthOpt)) {
      const v = avgTorsoWidthOpt[i];
      return Number.isFinite(v) ? v : null;
    }
    return Number.isFinite(avgTorsoWidthOpt) ? avgTorsoWidthOpt : null;
  };

  // ---------------------------
  // Smoothing state across frames
  // ---------------------------
  let avgHipWidthEMA = null;
  let xAdjustSmooth = 1;

  let prevLeftDir = null;
  let prevRightDir = null;

  let prevLeftFoot = null;
  let prevRightFoot = null;

  // Foreshortening state
  let torsoWidthSmooth = 0;
  let torsoWidthMaxEMA = null;
  let forward01Smooth = 0;

  // NEW hip-pull smoothing state
  let hipPullSmooth = clamp(hipPullStrength, 0, 1);

  // Track global bounds across all frames
  let xMax = -Infinity,
    yMax = -Infinity,
    xMin = Infinity,
    yMin = Infinity;

  for (let i = 0; i < landmarksArray.length; i++) {
    const lm = landmarksArray[i];
    if (!Array.isArray(lm)) continue;

    // Per-frame bounds (for existing points)
    let frameXMax = -Infinity,
      frameYMax = -Infinity,
      frameXMin = Infinity,
      frameYMin = Infinity;

    for (let j = 0; j < 17; j++) {
      if (!hasXY(lm[j])) continue;
      frameXMax = Math.max(frameXMax, lm[j].x);
      frameYMax = Math.max(frameYMax, lm[j].y);
      frameXMin = Math.min(frameXMin, lm[j].x);
      frameYMin = Math.min(frameYMin, lm[j].y);
    }

    // Extract relevant landmarks
    const leftHip = lm[11];
    const rightHip = lm[12];
    const leftKnee = lm[13];
    const rightKnee = lm[14];
    const leftAnkle = lm[15];
    const rightAnkle = lm[16];

    // Ensure all required landmarks are present
    if (!hasXY(leftHip) || !hasXY(rightHip) || !hasXY(leftKnee) || !hasXY(rightKnee) || !hasXY(leftAnkle) || !hasXY(rightAnkle)) {
      continue;
    }

    // Confidence gating: if pose confidence dips, reuse previous feet (optional)
    const minScoreThisFrame = Math.min(
      getScore(leftHip),
      getScore(rightHip),
      getScore(leftKnee),
      getScore(rightKnee),
      getScore(leftAnkle),
      getScore(rightAnkle)
    );

    if (allowReuseOnLowScore && minScoreThisFrame < minPartScore) {
      if (prevLeftFoot) lm[17] = { x: prevLeftFoot.x, y: prevLeftFoot.y, score };
      if (prevRightFoot) lm[18] = { x: prevRightFoot.x, y: prevRightFoot.y, score };

      if (lm[17] && lm[18]) {
        xMax = Math.max(xMax, frameXMax, lm[17].x, lm[18].x);
        yMax = Math.max(yMax, frameYMax, lm[17].y, lm[18].y);
        xMin = Math.min(xMin, frameXMin, lm[17].x, lm[18].x);
        yMin = Math.min(yMin, frameYMin, lm[17].y, lm[18].y);
      }
      continue;
    }

    // ---------------------------
    // Hip width smoothing (EMA)
    // ---------------------------
    const currentHipWidth = Math.hypot(rightHip.x - leftHip.x, rightHip.y - leftHip.y);

    if (!Number.isFinite(currentHipWidth) || currentHipWidth < 1e-6) {
      if (prevLeftFoot) lm[17] = { x: prevLeftFoot.x, y: prevLeftFoot.y, score };
      if (prevRightFoot) lm[18] = { x: prevRightFoot.x, y: prevRightFoot.y, score };
      continue;
    }

    if (avgHipWidthEMA == null) avgHipWidthEMA = currentHipWidth;
    avgHipWidthEMA = avgHipWidthEMA + hipWidthEmaK * (currentHipWidth - avgHipWidthEMA);

    // xAdjust based on hip width ratio (clamped + smoothed)
    const rawXAdjust = avgHipWidthEMA / currentHipWidth;
    const clampedXAdjust = clamp(rawXAdjust, xAdjustClamp[0], xAdjustClamp[1]);
    xAdjustSmooth = xAdjustSmooth + xAdjustEmaK * (clampedXAdjust - xAdjustSmooth);

    // ---------------------------
    // Foreshortening scale from avgTorsoWidth (optional)
    // ---------------------------
    let footForeshortenScale = 1.0;

    const tw = getAvgTorsoWidthForFrame(i);
    if (tw != null) {
      torsoWidthSmooth = torsoWidthSmooth + torsoWidthEmaK * (tw - torsoWidthSmooth);

      let ref = null;
      if (torsoWidthRefMode === "custom" && Number.isFinite(torsoWidthRef) && torsoWidthRef > EPS) {
        ref = torsoWidthRef;
      } else if (torsoWidthRefMode === "emaMax") {
        if (torsoWidthMaxEMA == null) torsoWidthMaxEMA = torsoWidthSmooth;
        const maxObs = Math.max(torsoWidthMaxEMA, torsoWidthSmooth);
        torsoWidthMaxEMA = torsoWidthMaxEMA + torsoWidthEmaK * (maxObs - torsoWidthMaxEMA);
        ref = torsoWidthMaxEMA;
      } else {
        ref = avgHipWidthEMA; // "hip" mode default
      }

      const forward01 = clamp(torsoWidthSmooth / (ref + EPS), 0, 1);
      forward01Smooth = forward01Smooth + torsoWidthEmaK * (forward01 - forward01Smooth);

      const eased = ease01(forward01Smooth);
      footForeshortenScale = clamp(1 - maxFootShorten * eased, 0.5, 1.0);
    }

    // ---------------------------
    // NEW: Smooth hip pull strength (rotation-safe)
    // ---------------------------
    hipPullSmooth = hipPullSmooth + hipPullEmaK * (clamp(hipPullStrength, 0, 1) - hipPullSmooth);

    // ---------------------------
    // Build direction vectors
    // ---------------------------
    // IMPORTANT: We do NOT apply a global "yAdjust" here, because that breaks for
    // upside-down / flips. Instead, we add a rotation-safe bias toward ankle->hip.
    //
    // Base: hip->knee, with sideways emphasis via xAdjustSmooth (pose-facing heuristic).
    // Then: blend base direction with ankle->hip direction (pull toward hips).

    const leftHipToKnee = { x: leftKnee.x - leftHip.x, y: leftKnee.y - leftHip.y };
    const rightHipToKnee = { x: rightKnee.x - rightHip.x, y: rightKnee.y - rightHip.y };

    // Side-facing vs forward-facing adjustment (only on X component; rotation-safe-ish as a heuristic)
    const leftBiasedVec = { x: leftHipToKnee.x * xAdjustSmooth, y: leftHipToKnee.y };
    const rightBiasedVec = { x: rightHipToKnee.x * xAdjustSmooth, y: rightHipToKnee.y };

    let leftBaseDir = norm(leftBiasedVec);
    let rightBaseDir = norm(rightBiasedVec);

    // Rotation-safe "toward hips" direction (ankle -> hip)
    const leftAnkleToHipDir = norm({ x: leftHip.x - leftAnkle.x, y: leftHip.y - leftAnkle.y });
    const rightAnkleToHipDir = norm({ x: rightHip.x - rightAnkle.x, y: rightHip.y - rightAnkle.y });

    // Blend base direction with ankle->hip direction
    // More drastic toward hips = larger hipPullStrength (default 0.55)
    let leftDir = norm({
      x: leftBaseDir.x * (1 - hipPullSmooth) + leftAnkleToHipDir.x * hipPullSmooth,
      y: leftBaseDir.y * (1 - hipPullSmooth) + leftAnkleToHipDir.y * hipPullSmooth,
    });

    let rightDir = norm({
      x: rightBaseDir.x * (1 - hipPullSmooth) + rightAnkleToHipDir.x * hipPullSmooth,
      y: rightBaseDir.y * (1 - hipPullSmooth) + rightAnkleToHipDir.y * hipPullSmooth,
    });

    // Direction smoothing (adaptive lerp) + max turn-rate limit
    leftDir = limitDirTurn(prevLeftDir, leftDir, maxDirDeltaRad);
    rightDir = limitDirTurn(prevRightDir, rightDir, maxDirDeltaRad);

    if (prevLeftDir) {
      const a = safeDirAlpha(prevLeftDir, leftDir);
      leftDir = norm({ x: lerp(prevLeftDir.x, leftDir.x, a), y: lerp(prevLeftDir.y, leftDir.y, a) });
    }
    if (prevRightDir) {
      const a = safeDirAlpha(prevRightDir, rightDir);
      rightDir = norm({ x: lerp(prevRightDir.x, rightDir.x, a), y: lerp(prevRightDir.y, rightDir.y, a) });
    }

    // ---------------------------
    // Foot length from shank length (with foreshortening)
    // ---------------------------
    const leftShankLen = Math.hypot(leftAnkle.x - leftKnee.x, leftAnkle.y - leftKnee.y);
    const rightShankLen = Math.hypot(rightAnkle.x - rightKnee.x, rightAnkle.y - rightKnee.y);

    const leftFootLen = leftShankLen * footLenRatio * footForeshortenScale;
    const rightFootLen = rightShankLen * footLenRatio * footForeshortenScale;

    // Raw foot points from ankle + smoothed direction
    let leftFoot = { x: leftAnkle.x + leftDir.x * leftFootLen, y: leftAnkle.y + leftDir.y * leftFootLen };
    let rightFoot = { x: rightAnkle.x + rightDir.x * rightFootLen, y: rightAnkle.y + rightDir.y * rightFootLen };

    // Position smoothing on the foot point
    if (prevLeftFoot) leftFoot = lerpPt(prevLeftFoot, leftFoot, posBeta);
    if (prevRightFoot) rightFoot = lerpPt(prevRightFoot, rightFoot, posBeta);

    // Assign landmarks 17 and 18
    lm[17] = { x: leftFoot.x, y: leftFoot.y, score };
    lm[18] = { x: rightFoot.x, y: rightFoot.y, score };

    // Update prevs
    prevLeftDir = leftDir;
    prevRightDir = rightDir;
    prevLeftFoot = leftFoot;
    prevRightFoot = rightFoot;

    // Update global bounds including new foot points
    xMax = Math.max(xMax, frameXMax, lm[17].x, lm[18].x);
    yMax = Math.max(yMax, frameYMax, lm[17].y, lm[18].y);
    xMin = Math.min(xMin, frameXMin, lm[17].x, lm[18].x);
    yMin = Math.min(yMin, frameYMin, lm[17].y, lm[18].y);
  }

  // If bounds never updated, avoid NaNs
  if (!Number.isFinite(xMax) || !Number.isFinite(xMin) || !Number.isFinite(yMax) || !Number.isFinite(yMin)) {
    return { landmarksArray, croppedWidth: 0, croppedHeight: 0 };
  }

  const w = xMax - xMin;
  const h = yMax - yMin;

  // Add 10% padding
  const croppedWidth = w + 0.1 * w;
  const croppedHeight = h + 0.1 * h;

  return { landmarksArray, croppedWidth, croppedHeight };
}