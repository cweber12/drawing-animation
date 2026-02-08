
export class FootCalculator {
  /* Initialize state for foot estimation
  ----------------------------------------------------------------------------*/
  constructor() {
    // Average Hip Width for scaling and detecting flips
    this.avgHipWidth = 0;
    this.currentHipWidth = 0;
    this.hipAlpha = 0.1;
    this.initFlipFlag = false;
    this.sameAfterFlipCount = 0;

    // Leg angles for calculating ankle angle and foot position
    this.avgRightLegAngle = 0;
    this.currentRightLegAngle = 0;
    this.avgLeftLegAngle = 0;
    this.currentLeftLegAngle = 0;

    // Direction of leg bend (+1 / -1)
    this.currentRightLegDirection = 1;
    this.currentLeftLegDirection = 1;

    // Reference angles for foot estimation
    this.leftThetaRef = null;
    this.rightThetaRef = null;

    // Default side orientation (relative to knee->ankle axis)
    // left foot outward = negative, right foot outward = positive
    this.leftAlphaRef = -(3 * Math.PI) / 4;
    this.rightAlphaRef = (3 * Math.PI) / 4;

    // Current alphas
    this.leftAlpha = this.leftAlphaRef;
    this.rightAlpha = this.rightAlphaRef;

    // Gain for knee -> foot angle relation
    this.kneeToFootGain = 1.0; // scale bend influence (0..1+)

    // Knee bend normalization span
    this.maxBend = Math.PI * 0.75;

    // Flip-only smoothing state
    this.prevLeftKneeDir = 1;
    this.prevRightKneeDir = 1;

    this.leftFlipT = 1;   // 1 => no active transition
    this.rightFlipT = 1;
    this.flipFrames = 5;  // tune: 3..8

    this.leftFlipFrom = this.leftAlphaRef;
    this.leftFlipTo = this.leftAlphaRef;
    this.rightFlipFrom = this.rightAlphaRef;
    this.rightFlipTo = this.rightAlphaRef;
  }

  _clamp01(t) {
    return Math.max(0, Math.min(1, t));
  }

  _lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Keep angle in (-PI, PI]
  _wrapPi(a) {
    let x = (a + Math.PI) % (2 * Math.PI);
    if (x < 0) x += 2 * Math.PI;
    return x - Math.PI;
  }

  // Step from prev -> target by at most maxStep, shortest angular route
  _stepAngle(prev, target, maxStep) {
    const diff = this._wrapPi(target - prev);
    const step = Math.max(-maxStep, Math.min(maxStep, diff));
    return prev + step;
  }

  /* Update average hip width with smoothing and flip detection
  ----------------------------------------------------------------------------*/
  _updateAvgHipWidth(newWidth) {
    if (this.avgHipWidth !== 0) {
      if (newWidth > 1.5 * this.avgHipWidth || newWidth < 0.5 * this.avgHipWidth) {
        return; // ignore big jumps
      }
    }

    if (newWidth * this.avgHipWidth > 0) {
      if (this.initFlipFlag) {
        this.hipAlpha = 0.3;
        this.initFlipFlag = false;
      } else if (this.sameAfterFlipCount < 3) {
        this.sameAfterFlipCount++;
      } else {
        this.sameAfterFlipCount = 0;
        this.hipAlpha = 0.1;
      }
    } else {
      this.hipAlpha = 0.1;
      this.sameAfterFlipCount = 0;
      this.initFlipFlag = true;
    }

    this.currentHipWidth = newWidth;
    if (this.avgHipWidth === 0) {
      this.avgHipWidth = newWidth;
    } else {
      this.avgHipWidth = this.hipAlpha * newWidth + (1 - this.hipAlpha) * this.avgHipWidth;
    }
  }

  /* Update average right leg angle
  ----------------------------------------------------------------------------*/
  _updateAvgRightLegAngle(newAngle) {
    const angleAlpha = 0.1;
    if (this.avgRightLegAngle === 0) {
      this.avgRightLegAngle = newAngle;
    } else {
      this.avgRightLegAngle = angleAlpha * newAngle + (1 - angleAlpha) * this.avgRightLegAngle;
    }
  }

  /* Update average left leg angle
  ----------------------------------------------------------------------------*/
  _updateAvgLeftLegAngle(newAngle) {
    const angleAlpha = 0.1;
    if (this.avgLeftLegAngle === 0) {
      this.avgLeftLegAngle = newAngle;
    } else {
      this.avgLeftLegAngle = angleAlpha * newAngle + (1 - angleAlpha) * this.avgLeftLegAngle;
    }
  }

  /* Calculate angle between two vectors with direction
  ----------------------------------------------------------------------------*/
  _calculateAngleBetweenVectors(v1, v2) {
    const dot = v1.x * v2.x + v1.y * v2.y;
    const m1 = Math.hypot(v1.x, v1.y);
    const m2 = Math.hypot(v2.x, v2.y);

    // Guard against zero-length vectors
    if (m1 < 1e-9 || m2 < 1e-9) {
      return { angle: 0, direction: 1 };
    }

    const cosine = dot / (m1 * m2);

    const cross = v1.x * v2.y - v1.y * v2.x;
    const direction = Math.sign(cross) || 1; // avoid 0

    const angle = Math.acos(Math.min(Math.max(cosine, -1), 1)); // 0..pi
    return { angle, direction };
  }

  /* Rotate vector by angle t (radians)
  ----------------------------------------------------------------------------*/
  _rotate(v, t) {
    const c = Math.cos(t);
    const s = Math.sin(t);
    return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
  }

  /* Normalize vector
  ----------------------------------------------------------------------------*/
  _norm(v) {
    const m = Math.hypot(v.x, v.y) || 1e-9;
    return { x: v.x / m, y: v.y / m };
  }

  /* Update left leg angle and direction
  ----------------------------------------------------------------------------*/
  _updateLeftLegAngle(leftHip, leftKnee, leftAnkle) {
    const vThigh = { x: leftHip.x - leftKnee.x, y: leftHip.y - leftKnee.y };     // knee->hip
    const vShank = { x: leftAnkle.x - leftKnee.x, y: leftAnkle.y - leftKnee.y }; // knee->ankle
    const { angle, direction } = this._calculateAngleBetweenVectors(vThigh, vShank);

    this.currentLeftLegAngle = angle;
    this.currentLeftLegDirection = direction;
    this._updateAvgLeftLegAngle(angle);

    if (this.leftThetaRef === null) {
      this.leftThetaRef = angle;
    }
  }

  /* Update right leg angle and direction
  ----------------------------------------------------------------------------*/
  _updateRightLegAngle(rightHip, rightKnee, rightAnkle) {
    const vThigh = { x: rightHip.x - rightKnee.x, y: rightHip.y - rightKnee.y };     // knee->hip
    const vShank = { x: rightAnkle.x - rightKnee.x, y: rightAnkle.y - rightKnee.y }; // knee->ankle
    const { angle, direction } = this._calculateAngleBetweenVectors(vThigh, vShank);

    this.currentRightLegAngle = angle;
    this.currentRightLegDirection = direction;
    this._updateAvgRightLegAngle(angle);

    if (this.rightThetaRef === null) {
      this.rightThetaRef = angle;
    }
  }

  /* Estimate foot coordinate from knee and ankle positions and angles
  ------------------------------------------------------------------------------
  Behavior:
  - |alpha| is bounded between:
      straight leg -> 3PI/4
      bent leg     -> PI/2
  - Smoothing only occurs when knee direction flips:
      interpolate between old max (+/-3PI/4) and new max (+/-3PI/4)
  - Otherwise alpha snaps directly to current bounded target.
  ----------------------------------------------------------------------------*/
  _estimateFootCoordinate({
    theta,
    thetaRef,
    alphaRef,
    knee,
    ankle,
    hip,
    footLenRatio = 0.5,
    side,
  }) {
    // 1) Shank direction and length
    const kneeToAnkle = { x: ankle.x - knee.x, y: ankle.y - knee.y };
    const u = this._norm(kneeToAnkle);
    const shankLen = Math.hypot(kneeToAnkle.x, kneeToAnkle.y);
    const footLen = shankLen * footLenRatio;

    // 2) Bend factor: 0=straight, 1=bent
    const bendAmount = Math.max(0, Math.PI - theta);
    const bendT = this._clamp01(
      (this.kneeToFootGain * bendAmount) / Math.max(this.maxBend, 1e-6)
    );

    // 3) Angle bounds (your requirement)
    const ALPHA_STRAIGHT = (3 * Math.PI) / 4; // 135°
    const ALPHA_BENT = Math.PI / 2;           // 90°
    const alphaMag = this._lerp(ALPHA_STRAIGHT, ALPHA_BENT, bendT);

    // ------------------------------------------------------------------
    // 4) Determine outward side robustly (fixes "both feet same direction")
    // ------------------------------------------------------------------
    // Build thigh vector (hip->knee) and signed knee orientation wrt shank.
    const thigh = { x: knee.x - hip.x, y: knee.y - hip.y };
    const cross = u.x * thigh.y - u.y * thigh.x; // z-component

    // If cross > 0, thigh is on one side of shank; if <0, opposite side.
    // We want foot to point OUTWARD from body:
    // - left foot uses opposite side convention from right foot.
    // This guarantees opposite directions between feet.
    let outwardSign;
    if (side === "left") {
      outwardSign = cross >= 0 ? 1 : -1;
    } else {
      outwardSign = cross >= 0 ? -1 : 1;
    }

    // Stable fallback when nearly collinear (cross ~ 0): keep previous sign
    const eps = 1e-6;
    if (Math.abs(cross) < eps) {
      const prev = side === "left" ? this.leftAlpha : this.rightAlpha;
      outwardSign = prev >= 0 ? 1 : -1;
    }

    const directTargetAlpha = outwardSign * alphaMag;

    // ------------------------------------------------------------------
    // 5) Smooth ONLY on direction flips (max->max), otherwise snap
    // ------------------------------------------------------------------
    let flipT, flipFrom, flipTo, prevAlpha;
    if (side === "left") {
      flipT = this.leftFlipT;
      flipFrom = this.leftFlipFrom;
      flipTo = this.leftFlipTo;
      prevAlpha = this.leftAlpha;
    } else {
      flipT = this.rightFlipT;
      flipFrom = this.rightFlipFrom;
      flipTo = this.rightFlipTo;
      prevAlpha = this.rightAlpha;
    }

    const prevSign = prevAlpha >= 0 ? 1 : -1;
    const currSign = outwardSign;
    const signFlipped = prevSign !== currSign;

    if (signFlipped && flipT >= 1) {
      flipFrom = prevSign * ALPHA_STRAIGHT;
      flipTo = currSign * ALPHA_STRAIGHT;
      flipT = 0;
    }

    let alpha;
    if (flipT < 1) {
      const step = 1 / Math.max(this.flipFrames, 1);
      flipT = Math.min(1, flipT + step);
      alpha = this._lerp(flipFrom, flipTo, flipT);
    } else {
      alpha = directTargetAlpha;
    }

    // Persist
    if (side === "left") {
      this.leftAlpha = alpha;
      this.leftFlipT = flipT;
      this.leftFlipFrom = flipFrom;
      this.leftFlipTo = flipTo;
    } else {
      this.rightAlpha = alpha;
      this.rightFlipT = flipT;
      this.rightFlipFrom = flipFrom;
      this.rightFlipTo = flipTo;
    }

    // 6) Final foot coordinate
    const dir = this._rotate(u, alpha);
    return {
      x: ankle.x + dir.x * footLen,
      y: ankle.y + dir.y * footLen,
      alpha,
    };
  }

  _estimateLeftFootCoordinate(leftHip, leftKnee, leftAnkle) {
    const theta = this.avgLeftLegAngle;
    const thetaRef = this.leftThetaRef ?? theta;
    return this._estimateFootCoordinate({
      theta,
      thetaRef,
      alphaRef: this.leftAlphaRef,
      knee: leftKnee,
      ankle: leftAnkle,
      hip: leftHip,
      footLenRatio: 0.5,
      side: "left",
    });
  }

  _estimateRightFootCoordinate(rightHip, rightKnee, rightAnkle) {
    const theta = this.avgRightLegAngle;
    const thetaRef = this.rightThetaRef ?? theta;
    return this._estimateFootCoordinate({
      theta,
      thetaRef,
      alphaRef: this.rightAlphaRef,
      knee: rightKnee,
      ankle: rightAnkle,
      hip: rightHip,
      footLenRatio: 0.5,
      side: "right",
    });
  }

  /* Add foot landmarks to landmarks array
  ----------------------------------------------------------------------------*/
  addFeetToLandmarks(landmarksArray) {
    for (let i = 0; i < landmarksArray.length; i++) {
      const landmarks = landmarksArray[i];
      if (!landmarks) continue;

      const leftHip = landmarks[11];
      const rightHip = landmarks[12];
      const leftKnee = landmarks[13];
      const rightKnee = landmarks[14];
      const leftAnkle = landmarks[15];
      const rightAnkle = landmarks[16];

      if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
        continue;
      }

      const hipWidth = Math.hypot(rightHip.x - leftHip.x, rightHip.y - leftHip.y);
      this._updateAvgHipWidth(hipWidth);

      this._updateLeftLegAngle(leftHip, leftKnee, leftAnkle);
      this._updateRightLegAngle(rightHip, rightKnee, rightAnkle);

      const leftFoot = this._estimateLeftFootCoordinate(leftHip, leftKnee, leftAnkle);
      const rightFoot = this._estimateRightFootCoordinate(rightHip, rightKnee, rightAnkle);

      landmarks[17] = { x: leftFoot.x, y: leftFoot.y, score: 0.9 };
      landmarks[18] = { x: rightFoot.x, y: rightFoot.y, score: 0.9 };
    }

    return landmarksArray;
  }
}