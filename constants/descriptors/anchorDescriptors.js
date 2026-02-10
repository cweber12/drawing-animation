import { LANDMARKS } from './landmarkDescriptors'
export const ANCHOR_MAP = {

    rightUpperArm: { 
        start: LANDMARKS.rightShoulder, 
        end: LANDMARKS.rightElbow,
    },

    rightLowerArm: { 
        // Horizontal orientation      
        start: LANDMARKS.rightElbow, 
        end: LANDMARKS.rightWrist, 
    },

    rightHand: {
        start: LANDMARKS.rightWrist,
        end: LANDMARKS.rightElbow, 
    },

    leftUpperArm: {
        start: LANDMARKS.leftShoulder, 
        end: LANDMARKS.leftElbow,
    },

    leftLowerArm: {
        start: LANDMARKS.leftElbow, 
        end: LANDMARKS.leftWrist,
    },

    leftHand: {
        start: LANDMARKS.leftWrist,
        end: LANDMARKS.leftElbow, 
    },

    rightFoot: {
        start: LANDMARKS.rightAnkle, 
        end: LANDMARKS.rightFoot, 
    },
    
    leftFoot: {
        start: LANDMARKS.leftAnkle,
        end: LANDMARKS.leftFoot, 
    },
    
    leftUpperLeg: {
        start: LANDMARKS.leftHip,
        end: LANDMARKS.leftKnee, 
    },

    leftLowerLeg: {
        start: LANDMARKS.leftKnee,
        end: LANDMARKS.leftAnkle, 
    },

    rightUpperLeg: {
        start: LANDMARKS.rightHip,
        end: LANDMARKS.rightKnee, 
    },

    rightLowerLeg: {
        start: LANDMARKS.rightKnee,
        end: LANDMARKS.rightAnkle, 
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
};