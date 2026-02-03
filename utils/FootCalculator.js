/* FootCalculator.js
--------------------------------------------------------------------------------
Calculate and track leg angles and leg angle averages over time to estimate foot
positions based on knee positions.

- knee -> ankle <- foot angle assumed to always have opposite sign to
  hip -> knee <- ankle angle.

- foot position is estimated from ankle position, knee->ankle vector, and
  a foot angle derived from the knee angle.

- Used to add foot landmarks (17=left foot, 18=right foot) to pose landmarks.
------------------------------------------------------------------------------*/
export class FootCalculator {
  constructor() {
    // Average Hip Width for scaling and detecting flips
    this.avgHipWidth = 0;
    this.hipAlpha = 0.1;
    this.initFlipFlag = false;
    this.sameAfterFlipCount = 0;

    // Leg angles to calculating ankle angle and foot position
    this.avgRightLegAngle = 0;
    this.currentRightLegAngle = 0;
    this.avgLeftLegAngle = 0;
    this.currentLeftLegAngle = 0;

    // Direction of leg bend
    this.currentRightLegDirection = 0; // sign (+1/-1)
    this.currentLeftLegDirection = 0;  // sign (+1/-1)

    // Reference angles and alphas for foot estimation
    this.leftThetaRef = null;
    this.rightThetaRef = null;
    this.leftAlphaRef = 0;   
    this.rightAlphaRef = 0;

    // Smoothed alphas for foot angle
    this.leftAlpha = 0;
    this.rightAlpha = 0;

    // Gain for knee to foot angle relation
    this.kneeToFootGain = 1.0; // k in alpha = alphaRef + s*k*(theta-thetaRef)
  }

  /* Update average hip width with smoothing and flip detection
  ------------------------------------------------------------------------------
  1. Calculates difference between left and right hip x coord. 
     - Sign change indicates possible flip.
     - Ignore large sudden changes in hip width (>50%) to avoid outliers.
  2. If flip detected, wait for 3 consecutive frames with same sign to confirm.
  3. Update average hip width with exponential smoothing.
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
    const cosine = dot / (m1 * m2);

    const cross = v1.x * v2.y - v1.y * v2.x;
    const direction = Math.sign(cross) || 1; // avoid 0

    const angle = Math.acos(Math.min(Math.max(cosine, -1), 1)); // 0..pi (radians)
    return { angle, direction };
  }

  /* Rotate vector by angle t (radians)
  ----------------------------------------------------------------------------*/
  _rotate(v, t) {
    const c = Math.cos(t), s = Math.sin(t);
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
    const vThigh = { // knee -> hip
        x: leftHip.x - leftKnee.x, 
        y: leftHip.y - leftKnee.y 
    };    
    const vShank = { // knee->ankle
        x: leftAnkle.x - leftKnee.x, 
        y: leftAnkle.y - leftKnee.y 
    }; 
    const { angle, direction } = 
        this._calculateAngleBetweenVectors(vThigh, vShank);

    this.currentLeftLegAngle = angle;
    this.currentLeftLegDirection = direction;
    this._updateAvgLeftLegAngle(angle);


    if (this.leftThetaRef === null) {
      this.leftThetaRef = Math.min(angle - Math.PI / 8, 3 * Math.PI / 4); 
    } 
  }

  /* Update right leg angle and direction
  ----------------------------------------------------------------------------*/
  _updateRightLegAngle(rightHip, rightKnee, rightAnkle) {
    const vThigh = { // knee -> hip
        x: rightHip.x - rightKnee.x, 
        y: rightHip.y - rightKnee.y 
    };     
    const vShank = { // knee->ankle
        x: rightAnkle.x - rightKnee.x, 
        y: rightAnkle.y - rightKnee.y 
    };
    const { angle, direction } = 
        this._calculateAngleBetweenVectors(vThigh, vShank);

    this.currentRightLegAngle = angle;
    this.currentRightLegDirection = direction;
    this._updateAvgRightLegAngle(angle);

    if (this.rightThetaRef === null) {
      this.rightThetaRef = Math.min(angle - Math.PI / 8, 3 * Math.PI / 4); // init reference
    }
  }

  /* Estimate foot coordinate from knee and ankle positions and angles
  ------------------------------------------------------------------------------
  1. Calculate knee->ankle unit vector.
  2. Estimate foot length as ratio of shank length.
  3. Calculate ankle->foot direction by rotating knee->ankle vector by alpha
    (angle between ankle->foot and ankle->knee).
  4. Calculate foot position as ankle position + ankle->foot vector.
  5. Smooth alpha over time to avoid sudden jumps.
  6. Return foot position and alpha.
  ----------------------------------------------------------------------------*/
  _estimateFootCoordinate({
    theta,     // knee angle (rad)
    thetaRef,  // reference knee angle (rad)
    alphaRef,  // reference ankle-foot angle (rad)
    sideSign,  // +1/-1 to pick rotation side
    knee,      // knee position
    ankle,     // ankle position
    footLenRatio = 0.5, // foot length as ratio of shank length
    side,      // 'left' or 'right'
  }) {
    // ankle->knee vector (swapped so foot points away from knee)
    const kneeToAnkle = { x: ankle.x - knee.x, y: ankle.y - knee.y };
    const u = this._norm(kneeToAnkle);

    // placeholder foot length: ratio of shank length
    const shankLen = Math.hypot(knee.x - ankle.x, knee.y - ankle.y);
    const footLen = shankLen * footLenRatio;

    // alpha follows knee angle change
    const currAlpha = 
        alphaRef + sideSign * this.kneeToFootGain * (theta - thetaRef);
    const smoothing = 0.5;
    const prevAlpha = side === 'left' ? this.leftAlpha : this.rightAlpha;
    const alpha = smoothing * currAlpha + (1 - smoothing) * prevAlpha;
    if (side === 'left') {
      this.leftAlpha = alpha;
    } else if (side === 'right') {
      this.rightAlpha = alpha;
    }

    // ankle->foot direction
    //const dir = this._rotate(u, alpha);
    const dir = this._rotate(u, currAlpha);

    return {
      x: ankle.x + dir.x * footLen,
      y: ankle.y + dir.y * footLen,
      alpha, // angle between ankle->foot and ankle->knee (signed)
    };
  }

  /* Estimate left foot coordinate
  ------------------------------------------------------------------------------
  1. Get current left leg angle and direction.
  2. Use reference angle if available, otherwise use current angle.
  3. Call _estimateFootCoordinate with left leg parameters.
  4. Return estimated foot coordinate.
  ----------------------------------------------------------------------------*/
  _estimateLeftFootCoordinate(leftKnee, leftAnkle) {
    const theta = this.avgLeftLegAngle;
    const thetaRef = this.leftThetaRef ?? theta;
    const sideSign = this.currentLeftLegDirection || 1;
    return this._estimateFootCoordinate({
      theta,
      thetaRef,
      alphaRef: this.leftAlphaRef,
      sideSign,
      knee: leftKnee,
      ankle: leftAnkle,
      footLenRatio: 0.5,
      side: 'left',
    });
  }

  /* Estimate right foot coordinate
  ----------------------------------------------------------------------------*/
  _estimateRightFootCoordinate(rightKnee, rightAnkle) {
    const theta = this.avgRightLegAngle;
    const thetaRef = this.rightThetaRef ?? theta;
    const sideSign = this.currentRightLegDirection || 1;
    const side = 'right';
    return this._estimateFootCoordinate({
      theta,
      thetaRef,
      alphaRef: this.rightAlphaRef,
      sideSign,
      knee: rightKnee,
      ankle: rightAnkle,
      footLenRatio: 0.5,
      side,
    });
  }

  /* Add foot landmarks to landmarks array
  ------------------------------------------------------------------------------
  1. Check if required landmarks (hips, knees, ankles) are present. If not, no 
     need to estimate feet.
  2. Update average hip width for scaling and flip detection.
  3. Update left and right leg angles.
  4. Estimate left and right foot coordinates.
  5. Add foot landmarks (17=left foot, 18=right foot) to landmarks.
  6. Return updated landmarks array.
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

      const leftFoot = this._estimateLeftFootCoordinate(leftKnee, leftAnkle);
      const rightFoot = this._estimateRightFootCoordinate(rightKnee, rightAnkle);

      landmarks[17] = { x: leftFoot.x, y: leftFoot.y, score: 0.9 };
      landmarks[18] = { x: rightFoot.x, y: rightFoot.y, score: 0.9 };
    }

    return landmarksArray;
  }
}
