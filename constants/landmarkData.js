/* Landmark indices based on a standard pose estimation model 
------------------------------------------------------------------------------*/
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

/* Connections between pose landmark indices
------------------------------------------------------------------------------*/
export const CONNECTED_KEYPOINTS = [
  [5, 6],    // Shoulders
  [11, 12],  // Hips
  [5, 7],    // Left Arm
  [7, 9],    // Left Forearm
  [6, 8],    // Right Arm
  [8, 10],   // Right Forearm
  [11, 13],  // Left Thigh
  [13, 15],  // Left Calf
  [12, 14],  // Right Thigh
  [14, 16],  // Right Calf
  [5, 11],   // Left Side Torso
  [6, 12],   // Right Side Torso
];

/* Mapping of body parts to landmark indices for canvas rendering
------------------------------------------------------------------------------*/
export const CANVAS_LANDMARK_MAP = {

    rightUpperArm: { 
        rightCenter: LANDMARKS.rightShoulder, 
        leftCenter: LANDMARKS.rightElbow 
    },

    rightLowerArm: { 
        rightCenter: LANDMARKS.rightElbow, 
        leftCenter: LANDMARKS.rightWrist 
    },

    rightHand: {
        wrist: LANDMARKS.rightWrist,
        elbow: LANDMARKS.rightElbow // used only for rotation
    },

    leftUpperArm: { 
        leftCenter: LANDMARKS.leftShoulder, 
        rightCenter: LANDMARKS.leftElbow 
    },

    leftLowerArm: { 
        leftCenter: LANDMARKS.leftElbow, 
        rightCenter: LANDMARKS.leftWrist 
    },

    leftHand: {
        wrist: LANDMARKS.leftWrist,
        elbow: LANDMARKS.leftElbow // used only for rotation
    },
    
    leftUpperLeg: {
        start: LANDMARKS.leftHip,
        end: LANDMARKS.leftKnee
    },

    leftLowerLeg: {
        start: LANDMARKS.leftKnee,
        end: LANDMARKS.leftAnkle
    },

    rightUpperLeg: {
        start: LANDMARKS.rightHip,
        end: LANDMARKS.rightKnee
    },

    rightLowerLeg: {
        start: LANDMARKS.rightKnee,
        end: LANDMARKS.rightAnkle
    },

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

    rightFoot: {center: LANDMARKS.rightAnkle},
    leftFoot: {center: LANDMARKS.leftAnkle},

};