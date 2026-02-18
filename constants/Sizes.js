import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export function getIconSize() {
    if (width < 600) return 30;
    if (width < 800) return 34;
    return 38;
}

export function getWebcamDimensions() {
    return { width: 256, height: 224};
}

export const isSmallScreen = width < 600;

/*==============================================================================
                                CANVAS SIZES
==============================================================================*/
// Canvas holding all svgs
export const CANVAS_WIDTH = width * 0.9;
export const CANVAS_HEIGHT = height * 0.75;

// border radius for individual svgs
export const CANVAS_BORDER_RADIUS = 50;

/* Body Part Dimensions
------------------------------------------------------------------------------*/
export function getSvgSizes(height) {
    const TORSO_HEIGHT = height * 0.25;
    const TORSO_WIDTH = TORSO_HEIGHT * 0.9;    
    const HEAD_SIZE = TORSO_WIDTH; 
    const ARM_LENGTH = TORSO_HEIGHT * 0.65;
    const ARM_WIDTH = TORSO_WIDTH * 0.5; 
    const LEG_LENGTH = TORSO_HEIGHT * 0.6;
    const THIGH_LENGTH = TORSO_HEIGHT * 0.5;
    const CALF_LENGTH = TORSO_HEIGHT * 0.55;
    const LEG_WIDTH = TORSO_WIDTH * 0.5; 
    const HAND_LENGTH = ARM_LENGTH * 0.75
    const HAND_WIDTH = ARM_WIDTH; 
    const FOOT_LENGTH = CALF_LENGTH;
    const FOOT_WIDTH = LEG_WIDTH;
    const TOTAL_WIDTH = TORSO_WIDTH + (ARM_LENGTH * 4) + (HAND_LENGTH);
    const TOTAL_HEIGHT = TORSO_HEIGHT + HEAD_SIZE + LEG_LENGTH;

    return {
        TORSO_WIDTH,
        TORSO_HEIGHT,
        HEAD_SIZE,
        ARM_LENGTH,
        ARM_WIDTH,
        LEG_LENGTH,
        THIGH_LENGTH,
        CALF_LENGTH,
        LEG_WIDTH,
        HAND_LENGTH,
        HAND_WIDTH,
        FOOT_LENGTH,
        FOOT_WIDTH,
        TOTAL_WIDTH,
        TOTAL_HEIGHT,
    };
}

