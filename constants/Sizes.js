import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const CANVAS_WIDTH = width * 0.9;
export const CANVAS_HEIGHT = height * 0.88;
export const CANVAS_BORDER_RADIUS = 50;

export function getIconSize() {
    if (width < 400) return 24;
    if (width < 600) return 30;
    return 32;
}

export function getWebcamDimensions() {
    return { width: 256, height: 224};
}

export const isSmallScreen = width < 600;

/* Body Part Dimensions
------------------------------------------------------------------------------*/
export function getSvgSizes(height) {
    const TORSO_HEIGHT = height * 0.25;
    const TORSO_WIDTH = TORSO_HEIGHT * 0.85;    
    const HEAD_SIZE = TORSO_WIDTH; 
    const ARM_LENGTH = TORSO_HEIGHT * 0.65;
    const ARM_WIDTH = TORSO_WIDTH * 0.5; 
    const LEG_LENGTH = TORSO_HEIGHT * 0.65;
    const LEG_WIDTH = (TORSO_WIDTH * 0.5) - 1; 
    const HAND_LENGTH = ARM_LENGTH * 0.75
    const HAND_WIDTH = ARM_WIDTH; 
    const FOOT_LENGTH = LEG_WIDTH * 2;
    const FOOT_WIDTH = LEG_LENGTH * 0.5;

    return {
        TORSO_WIDTH,
        TORSO_HEIGHT,
        HEAD_SIZE,
        ARM_LENGTH,
        ARM_WIDTH,
        LEG_LENGTH,
        LEG_WIDTH,
        HAND_LENGTH,
        HAND_WIDTH,
        FOOT_LENGTH,
        FOOT_WIDTH,
    };
}

/* Average Torso Height and Width for Scaling
------------------------------------------------------------------------------*/
let avgTorsoHeight = 0;
let avgTorsoWidth = 0;
let currentTorsoWidth = 0;
let avgHipWidth = 0;
let currentHipWidth = 0;
let currentLeftHipX = 0;
let currentRightHipX = 0;
let prevLeftHipX = 0;
let prevRightHipX = 0;
let initFlipFlag = false; 
let sameAfterFlipCount = 0;
let confirmFlipFlag = false;
let directionCount;
let direction = 0; // 1: left to right, -1: right to left

const torsoAlpha = 0.1; 
let hipAlpha = 0.05; 
const earAlpha = 0.1;

export function updateAvgTorsoHeight(newHeight) {
    if (avgTorsoHeight === 0) {
        avgTorsoHeight = newHeight;
    } else {
        avgTorsoHeight = 
            torsoAlpha * newHeight + (1 - torsoAlpha) * avgTorsoHeight;
    }
}

export function getAvgTorsoHeight() {
    return avgTorsoHeight;
}

export function updateAvgTorsoWidth(newWidth) {
    currentTorsoWidth = newWidth;
    if (avgTorsoWidth === 0) {
        avgTorsoWidth = newWidth;
    } else {
        avgTorsoWidth = 
            torsoAlpha * newWidth + (1 - torsoAlpha) * avgTorsoWidth;
    }
}

export function getAvgTorsoWidth() {
    return avgTorsoWidth;
}


export function getCurrentTorsoWidth() {
    return currentTorsoWidth;
}

export function updateAvgHipWidth(newWidth) {    
    if (currentHipWidth * newWidth > 0) {
        
        if (initFlipFlag) {
            hipAlpha = 0.3;
            initFlipFlag = false;
        } else if (!confirmFlipFlag) {
            if (sameAfterFlipCount > 2) {
                confirmFlipFlag = true;
            } else {
                sameAfterFlipCount++;
            }
        } else if (confirmFlipFlag) {
            hipAlpha = 0.1;
            sameAfterFlipCount = 0;
            confirmFlipFlag = false;  
        }
        
    } else {
        hipAlpha = 0.1;
        sameAfterFlipCount = 0;
        confirmFlipFlag = false;
        if (!initFlipFlag) {
            initFlipFlag = true;
        }
    }
        
    currentHipWidth = newWidth;

    if (avgHipWidth === 0) {
        avgHipWidth = newWidth;
    } else {
        avgHipWidth = 
            hipAlpha * newWidth + (1 - hipAlpha) * avgHipWidth;
    }
}

export function getAvgHipWidth() {
    return avgHipWidth;
}

export function getCurrentHipWidth() {
    return currentHipWidth;
}

/* Average Ear Distance for Head Scaling
------------------------------------------------------------------------------*/
let avgEarDistance = 0;

export function updateAvgEarDistance(newDistance) {
    if (avgEarDistance === 0) {
        avgEarDistance = newDistance;
    } else {
        avgEarDistance = 
            earAlpha * newDistance + (1 - earAlpha) * avgEarDistance;
    }
}

export function getAvgEarDistance() {
    return avgEarDistance;
}

export function getEarX(leftEar, rightEar) {
    return rightEar.x - leftEar.x;
}

/* update avg left leg angle
------------------------------------------------------------------------------*/
let avgLeftLegAngle = 0;
export function updateAvgLeftLegAngle(newAngle) {
    const angleAlpha = 0.1;
    if (avgLeftLegAngle === 0) {
        avgLeftLegAngle = newAngle;
    } else {
        avgLeftLegAngle = 
            angleAlpha * newAngle + (1 - angleAlpha) * avgLeftLegAngle;
    }   
}

export function getAvgLeftLegAngle() {
    return avgLeftLegAngle;
}


