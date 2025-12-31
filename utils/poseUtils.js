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
                if ( typeof lm.x === 'number' && typeof lm.y === 'number') { 
                    
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