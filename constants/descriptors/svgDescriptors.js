// constants/descriptors/svgDescriptors.js

/* SVG TRANSFORMATION DEFINITIONS
--------------------------------------------------------------------------------
Definitions for svg shift and flip transformations for each body part, used to: 
- Shift SVGs so the relevant sides are centered and aligned on relevant anchors. 
  * Anchors initially aligned with top corners of viewbox. Without centering, 
    parts separate and become more misaligned as joint angle shifts from PI 
    (no bend) to 0 (full bend).
- F
  * Centering allows for more intuitive flipping by mirroring across the axis of 
    rotation (x-axis for legs/vertical arms, y-axis for horizontal arms).

------------------------------------------------------------------------------*/
export const SVG_TRANSFORMATIONS = {
        rightUpperArm: { 

        },
    
        rightLowerArm: { 
 
        },
    
        rightHand: {

        },
    
    
        leftUpperArm: {

        },
    
        leftLowerArm: {

        },
    
        leftHand: {

        },
    
        rightFoot: {

        },
        
        leftFoot: {

        },
        
        leftUpperLeg: {

        },
    
        leftLowerLeg: {

        },
    
        rightUpperLeg: {

        },
    
        rightLowerLeg: {

        },
         
    
        torso: {

        },
        
        head: {

        },   
}