import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const CANVAS_WIDTH = width * 0.9;
export const CANVAS_HEIGHT = height * 0.88;
export const CANVAS_BORDER_RADIUS = 24;

export const ICON_SIZE = 32;

export function getIconSize() {
    if (width < 400) return 20;
    if (width < 600) return 24;
    return 32;
}

export function getWebcamDimensions() {
    if (width < 600) return { width: 160, height: 120 };
    return { width: 320, height: 240 };
}

export const isSmallScreen = width < 600;

/* Body Part Dimensions
------------------------------------------------------------------------------*/
export const TORSO_WIDTH = isSmallScreen ? 
    SCREEN_WIDTH * 0.45 : 
    SCREEN_WIDTH * 0.1;

export const TORSO_HEIGHT = SCREEN_HEIGHT * 0.25;

export const HEAD_SIZE = TORSO_WIDTH; 

export const ARM_LENGTH = TORSO_HEIGHT * 0.65;


export const ARM_WIDTH = TORSO_WIDTH * 0.5; 

export const LEG_LENGTH = TORSO_HEIGHT * 0.65;


export const LEG_WIDTH = (TORSO_WIDTH * 0.5) - 1; 


export const HAND_LENGTH = isSmallScreen ? 
    ARM_LENGTH * 0.6 : 
    ARM_LENGTH * 0.6;

export const HAND_WIDTH = ARM_WIDTH; 

export const FOOT_LENGTH = LEG_WIDTH * 2;

export const FOOT_WIDTH = LEG_LENGTH * 0.5;