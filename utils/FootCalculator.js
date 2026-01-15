/* FootCalculator.js
--------------------------------------------------------------------------------
   A class to calculate and track leg angles and directions over time.
------------------------------------------------------------------------------*/

// import { update } from "lodash"; // <- not used, can remove

export class FootCalculator {
  constructor() {
    this.avgHipWidth = 0;
    this.hipAlpha = 0.1;
    this.initFlipFlag = false;
    this.sameAfterFlipCount = 0;

    this.avgRightLegAngle = 0;
    this.currentRightLegAngle = 0;
    this.avgLeftLegAngle = 0;
    this.currentLeftLegAngle = 0;

    this.currentRightLegDirection = 0; // sign (+1/-1)
    this.currentLeftLegDirection = 0;  // sign (+1/-1)

    // --- NEW: reference angles for “knee drives foot” mapping ---
    this.leftThetaRef = null;
    this.rightThetaRef = null;
    this.leftAlphaRef = 0;   
    this.rightAlphaRef = 0;

    this.leftAlpha = 0;
    this.rightAlpha = 0;

    this.kneeToFootGain = 1.0; // k in alpha = alphaRef + s*k*(theta-thetaRef)
  }

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

  _updateAvgRightLegAngle(newAngle) {
    const angleAlpha = 0.1;
    if (this.avgRightLegAngle === 0) {
      this.avgRightLegAngle = newAngle;
    } else {
      this.avgRightLegAngle = angleAlpha * newAngle + (1 - angleAlpha) * this.avgRightLegAngle;
    }
    //console.log("Avg Right Leg Angle (deg): ", (this.avgRightLegAngle * 180 / Math.PI).toFixed(1));
  }

  _updateAvgLeftLegAngle(newAngle) {
    const angleAlpha = 0.1;
    if (this.avgLeftLegAngle === 0) {
      this.avgLeftLegAngle = newAngle;
    } else {
      this.avgLeftLegAngle = angleAlpha * newAngle + (1 - angleAlpha) * this.avgLeftLegAngle;
    }
    //console.log("Avg Left Leg Angle (deg): ", (this.avgLeftLegAngle * 180 / Math.PI).toFixed(1));
  }

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

  _rotate(v, t) {
    const c = Math.cos(t), s = Math.sin(t);
    return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
  }

  _norm(v) {
    const m = Math.hypot(v.x, v.y) || 1e-9;
    return { x: v.x / m, y: v.y / m };
  }

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
    //console.log("Left Leg Angle (deg): ", (angle * 180 / Math.PI).toFixed(1), " Dir: ", direction);

    if (this.leftThetaRef === null) {
      this.leftThetaRef = Math.min(angle - Math.PI / 8, 3 * Math.PI / 4); // init reference
    } 
  }

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
    //console.log("Right Leg Angle (deg): ", (angle * 180 / Math.PI).toFixed(1), " Dir: ", direction);

    if (this.rightThetaRef === null) {
      this.rightThetaRef = Math.min(angle - Math.PI / 8, 3 * Math.PI / 4); // init reference
    }
  }

  _estimateFootCoordinate({
    theta,           // knee angle (rad)
    thetaRef,        // reference knee angle (rad)
    alphaRef,        // reference ankle-foot angle (rad)
    sideSign,        // +1/-1 to pick rotation side
    knee,
    ankle,
    footLenRatio = 0.5,
    side,
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

      // (optional) if you want the angles available downstream:
      // landmarks.leftFootAlpha = leftFoot.alpha;
      // landmarks.rightFootAlpha = rightFoot.alpha;
    }

    return landmarksArray;
  }
}
