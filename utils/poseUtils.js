export function smoothLandmarks(landmarksArray, windowSize = 5) {
    if (windowSize < 1) return landmarksArray;
    const halfWindow = Math.floor(windowSize / 2);
    const smoothed = [];

    for (let i = 0; i < landmarksArray.length; i++) {
        const frame = [];
        const start = Math.max(0, i - halfWindow);
        const end = Math.min(landmarksArray.length - 1, i + halfWindow);

        for (let j = 0; j < landmarksArray[i].length; j++) {
            let sumX = 0, sumY = 0, sumZ = 0, count = 0;
            for (let k = start; k <= end; k++) {
                sumX += landmarksArray[k][j].x;
                sumY += landmarksArray[k][j].y;
                if ('z' in landmarksArray[k][j]) sumZ += landmarksArray[k][j].z;
                count++;
            }
            const avgLandmark = {
                x: sumX / count,
                y: sumY / count
            };
            if ('z' in landmarksArray[i][j]) {
                avgLandmark.z = sumZ / count;
            }
            frame.push(avgLandmark);
        }
        smoothed.push(frame);
    }
    return smoothed;
}