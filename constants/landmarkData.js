export const LANDMARKS = {
    nose: 0,
    leftEye: 1,
    rightEye: 2,
    leftEar: 3,
    rightEar: 4,
    leftShoulder: 5,
    rightShoulder: 6,
    leftElbow: 7,
    rightElbow: 8,
    leftWrist: 9,
    rightWrist: 10,
    leftHip: 11,
    rightHip: 12,
    leftKnee: 13,
    rightKnee: 14,
    leftAnkle: 15,
    rightAnkle: 16,
};

export const CONNECTED_KEYPOINTS = [
  [5, 6], [11, 12],
  [5, 7], [7, 9],
  [6, 8], [8, 10],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  [5, 11], [6, 12],
];

export const CANVAS_LANDMARK_MAP = {
    // Screen-left arm (your left on screen) = rightShoulder/rightElbow/rightWrist
    leftUpperArm: { 
        rightCenter: LANDMARKS.rightShoulder, 
        leftCenter: LANDMARKS.rightElbow 
    },
    leftLowerArm: { 
        rightCenter: LANDMARKS.rightElbow, 
        leftCenter: LANDMARKS.rightWrist 
    },

    // Screen-right arm (your right on screen) = leftShoulder/leftElbow/leftWrist
    rightUpperArm: { 
        leftCenter: LANDMARKS.leftShoulder, 
        rightCenter: LANDMARKS.leftElbow 
    },

    rightLowerArm: { 
        leftCenter: LANDMARKS.leftElbow, 
        rightCenter: LANDMARKS.leftWrist 
    },
    
    rightUpperLeg: {
        topRight: LANDMARKS.leftHip,
        bottomLeft: LANDMARKS.leftKnee},
    rightLowerLeg: {
        topRight: LANDMARKS.leftKnee,
        bottomLeft: LANDMARKS.leftAnkle},
    leftUpperLeg: {
        topLeft: LANDMARKS.rightHip,
        bottomRight: LANDMARKS.rightKnee},
    leftLowerLeg: {
        topLeft: LANDMARKS.rightKnee,
        bottomRight: LANDMARKS.rightAnkle},
    torso: {
        topRight: LANDMARKS.leftShoulder,
        topLeft: LANDMARKS.rightShoulder,
        bottomRight: LANDMARKS.leftHip,
        bottomLeft: LANDMARKS.rightHip, 
        shoulderAnchorLeft: LANDMARKS.leftShoulder,
        shoulderAnchorRight: LANDMARKS.rightShoulder,
    },
    head: {
        rightAnchor: LANDMARKS.leftEar,
        leftAnchor: LANDMARKS.rightEar,
    },
    leftFoot: {center: LANDMARKS.leftAnkle},
    rightFoot: {center: LANDMARKS.rightAnkle},

};