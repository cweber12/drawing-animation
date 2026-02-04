export class TorsoDimensions {
  constructor() {
    this.avgTorsoHeight = 0;
    this.avgTorsoWidth = 0;
    this.currentTorsoWidth = 0;
    this.avgHipWidth = 0;
    this.currentHipWidth = 0;
    this.initFlipFlag = false;
    this.sameAfterFlipCount = 0;
    this.confirmFlipFlag = false;
    this.torsoAlpha = 0.1;
    this.hipAlpha = 0.05;
  }

  updateAvgTorsoHeight(newHeight) {
    if (this.avgTorsoHeight === 0) {
      this.avgTorsoHeight = newHeight;
    } else {
      this.avgTorsoHeight =
        this.torsoAlpha * newHeight + (1 - this.torsoAlpha) * this.avgTorsoHeight;
    }
  }

  getAvgTorsoHeight() {
    return this.avgTorsoHeight;
  }

  updateAvgTorsoWidth(newWidth) {
    this.currentTorsoWidth = newWidth;
    if (this.avgTorsoWidth === 0) {
      this.avgTorsoWidth = newWidth;
    } else {
      this.avgTorsoWidth =
        this.torsoAlpha * newWidth + (1 - this.torsoAlpha) * this.avgTorsoWidth;
    }
  }

  getAvgTorsoWidth() {
    return this.avgTorsoWidth;
  }

  getCurrentTorsoWidth() {
    return this.currentTorsoWidth;
  }

  updateAvgHipWidth(newWidth) {
    if (this.currentHipWidth * newWidth > 0) {
      if (this.initFlipFlag) {
        this.hipAlpha = 0.3;
        this.initFlipFlag = false;
      } else if (!this.confirmFlipFlag) {
        if (this.sameAfterFlipCount > 2) {
          this.confirmFlipFlag = true;
        } else {
          this.sameAfterFlipCount++;
        }
      } else if (this.confirmFlipFlag) {
        this.hipAlpha = 0.1;
        this.sameAfterFlipCount = 0;
        this.confirmFlipFlag = false;
      }
    } else {
      this.hipAlpha = 0.1;
      this.sameAfterFlipCount = 0;
      this.confirmFlipFlag = false;
      if (!this.initFlipFlag) {
        this.initFlipFlag = true;
      }
    }

    this.currentHipWidth = newWidth;

    if (this.avgHipWidth === 0) {
      this.avgHipWidth = newWidth;
    } else {
      this.avgHipWidth =
        this.hipAlpha * newWidth + (1 - this.hipAlpha) * this.avgHipWidth;
    }
  }

  getAvgHipWidth() {
    return this.avgHipWidth;
  }

  getCurrentHipWidth() {
    return this.currentHipWidth;
  }
}

export default TorsoDimensions;