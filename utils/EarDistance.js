// utils/EarDistance.js

/*==============================================================================
                                EAR DISTANCE
================================================================================
Class to track and update the average distance between ears for scaling the head
SVG. Uses an exponential moving average to smooth out fluctuations in ear distance.
------------------------------------------------------------------------------*/
export class EarDistance {
  constructor() {
    this.avgEarDistance = 0;
    this.earAlpha = 0.3; 
  }

    updateAvgEarDistance(newDistance) { 
        if (this.avgEarDistance === 0) {
            this.avgEarDistance = newDistance;
        } else {
            this.avgEarDistance = 
                this.earAlpha * newDistance + (1 - this.earAlpha) * this.avgEarDistance;
        }
    }

    getAvgEarDistance() {
        return this.avgEarDistance;
    }

    getEarX(leftEar, rightEar) {
        return rightEar.x - leftEar.x;
    }
}

export default EarDistance; 

