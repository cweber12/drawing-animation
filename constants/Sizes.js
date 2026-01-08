import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const CANVAS_WIDTH = width * 0.9;
export const CANVAS_HEIGHT = height * 0.88;
export const CANVAS_BORDER_RADIUS = 50;

export const ICON_SIZE = 32;

export function getIconSize() {
    if (width < 400) return 20;
    if (width < 600) return 24;
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
const alpha = 0.1; // Smoothing factor

export function updateAvgTorsoHeight(newHeight) {
    if (avgTorsoHeight === 0) {
        avgTorsoHeight = newHeight;
    } else {
        avgTorsoHeight = 
            alpha * newHeight + (1 - alpha) * avgTorsoHeight;
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
            alpha * newWidth + (1 - alpha) * avgTorsoWidth;
    }
}

export function getAvgTorsoWidth() {
    return avgTorsoWidth;
}


export function getCurrentTorsoWidth() {
    return currentTorsoWidth;
}

export function updateAvgHipWidth(newWidth) {
    currentHipWidth = newWidth;
    if (avgHipWidth === 0) {
        avgHipWidth = newWidth;
    } else {
        avgHipWidth = 
            alpha * newWidth + (1 - alpha) * avgHipWidth;
    }
}

export function getAvgHipWidth() {
    return avgHipWidth;
}

export function getCurrentHipWidth() {
    return currentHipWidth;
}

export function rotatedAroundSpine() {
    return currentTorsoWidth < avgTorsoWidth * 0.5 && 
           currentHipWidth < avgHipWidth * 0.5; 
}

/* Average Ear Distance for Head Scaling
------------------------------------------------------------------------------*/
let avgEarDistance = 0;

export function updateAvgEarDistance(newDistance) {
    if (avgEarDistance === 0) {
        avgEarDistance = newDistance;
    } else {
        avgEarDistance = 
            alpha * newDistance + (1 - alpha) * avgEarDistance;
    }
}

export function getAvgEarDistance() {
    return avgEarDistance;
}

export function getEarX(leftEar, rightEar) {
    return rightEar.x - leftEar.x;
}

