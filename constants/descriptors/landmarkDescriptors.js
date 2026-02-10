/*==============================================================================
LANDMARK DATA CONSTANTS
==============================================================================*/
/* Landmark indices as per MoveNet model
Ref: https://www.kaggle.com/models/google/movenet
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
    leftFoot: 17,
    rightFoot: 18,
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
  [15, 17],  // Left Foot
  [16, 18],  // Right Foot
];






