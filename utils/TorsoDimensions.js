import { scale } from "@shopify/react-native-skia";

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
    
    this.torsoSvgHeight = 0;
    this.torsoSvgWidth = 0;
    
    this.scaleFactorY = 1.0;
    this.scaleFactorX = 1.0;
    
    this.currentLeftHipX = 0;
    this.currentRightHipX = 0;
    this.currentLeftShoulderX = 0;
    this.currentRightShoulderX = 0;
    
    this.topLeft = { x: 0, y: 0 };
    this.topRight = { x: 0, y: 0 };
    this.bottomLeft = { x: 0, y: 0 };
    this.bottomRight = { x: 0, y: 0 };
    
    this.leftSideVector = { x: 0, y: 0 };
    this.rightSideVector = { x: 0, y: 0 };
    this.hipVector = { x: 0, y: 0 };
  }

  _updateScaleFactorY() {
    if (this.torsoSvgHeight > 0) {
      this.scaleFactorY = this.avgTorsoHeight / this.torsoSvgHeight * 1.2;
    }
  }

  _updateScaleFactorX() {
    if (this.torsoSvgWidth > 0) {
      this.scaleFactorX = this.avgHipWidth/ this.torsoSvgWidth;
    }
  }
  
  updatePoints(topLeft, topRight, bottomLeft, bottomRight) {
    this.topLeft = topLeft;
    this.topRight = topRight;
    this.bottomLeft = bottomLeft;
    this.bottomRight = bottomRight;
    this.leftSideVector = {
      x: topLeft.x - bottomLeft.x,
      y: topLeft.y - bottomLeft.y,
    };
    this.rightSideVector = {
      x: topRight.x - bottomRight.x,
      y: topRight.y - bottomRight.y,
    };
    this.hipVector = {
      x: bottomRight.x - bottomLeft.x,
      y: bottomRight.y - bottomLeft.y,
    };
  }
  
  updateTorsoSvgDimensions(newHeight, newWidth) {
    this.torsoSvgHeight = newHeight;  
    this.torsoSvgWidth = newWidth;
  }
  
  updateAvgTorsoHeight(newHeight) {
    if (this.avgTorsoHeight === 0) {
      this.avgTorsoHeight = newHeight;
    } else {
      this.avgTorsoHeight =
        this.torsoAlpha * newHeight + (1 - this.torsoAlpha) * this.avgTorsoHeight;
    }
    this._updateScaleFactorY();
  }

  getAvgTorsoHeight() {
    return this.avgTorsoHeight;
  }

  updateAvgTorsoWidth(newWidth) {

    if (this.avgTorsoWidth === 0) {
      this.avgTorsoWidth = newWidth;
    } else {
      this.avgTorsoWidth =
        this.torsoAlpha * newWidth + (1 - this.torsoAlpha) * this.avgTorsoWidth;
    }
    //this._updateScaleFactorX();
  }

  getAvgTorsoWidth() {
    return this.avgTorsoWidth;
  }

  getCurrentTorsoWidth() {
    return this.currentTorsoWidth;
  }
  updateCurrentTorsoWidth(newWidth) {
    this.currentTorsoWidth = newWidth;
  }

  getCurrentHipWidth() {
    return this.currentHipWidth;
  }

  updateAvgHipWidth(newWidth) {
    this.updateCurrentTorsoWidth(newWidth);
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
    this._updateScaleFactorX();
  }

  getAvgHipWidth() {
    return this.avgHipWidth;
  }

  getCurrentHipWidth() {
    return this.currentHipWidth;
  }

  getCurrentLeftHipX() {
    return this.currentLeftHipX;
  }

  getCurrentRightHipX() {
    return this.currentRightHipX;
  }

  getPoints() {
    return {
      topLeft: this.topLeft,
      topRight: this.topRight,
      bottomLeft: this.bottomLeft,
      bottomRight: this.bottomRight,
    };
  }
}

export default TorsoDimensions;