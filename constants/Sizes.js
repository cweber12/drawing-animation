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

