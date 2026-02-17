// hooks/useCacheSvgs.js
import { useEffect, useRef } from 'react';
import { 
  getSvgDimensions, 
  addSvgClipPath,
  addSvgOpacityGradient, 
  svgStringToImage 
} from '../utils/svgUtils';

/* Hook to cache SVG images from SVG strings
--------------------------------------------------------------------------------
Takes in an object of SVG strings and returns a ref containing loaded Image
objects for each SVG part.
Props | svgs : object containing SVG strings 
      | but kept for consistency)
--------------------------------------------------------------------------------      
Returns | ref with cached Image objects
------------------------------------------------------------------------------*/
export function useCacheSvgs(svgs, torsoDimsRef) {
  const imagesRef = useRef({});
  const torsoDims = torsoDimsRef?.current;
  useEffect(() => {

    let cancelled = false;
    let roundCorners = true; // Set to true to enable rounded corners on SVGs
    (async () => {
      const next = {};

      for (const [part, svgString] of Object.entries(svgs)) {
        if (typeof svgString !== 'string' || svgString.trim().length === 0) continue;
        
        try {
          const { width: svgW, height: svgH } = getSvgDimensions(svgString);
          torsoDims.updateTorsoSvgDimensions(svgW, svgH);
          let svgToSend = svgString;
          
          if (part === 'torso') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW,
              svgH,
              svgW / 4, // radius
              false, //TL
              false, //TR
              false, //BR
              false  //BL
            );
          } else if (part === 'head' || part === 'headBack') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW,
              svgH,
              svgW / 4, // radius
              false, //TL
              false, //TR
              false, //BR
              false  //BL
            ); 
          } else if (part === 'leftLowerLeg' || part === 'rightLowerLeg' || 
            part === 'leftLowerLegBack' || part === 'rightLowerLegBack') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW,
              svgH,
              svgW / 4, // radius
              true, //TL
              true, //TR
              true, //BR
              true  //BL
            ); 
          } else if (part === 'leftUpperLeg' || part === 'leftUpperLegBack') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW, svgH,
              svgW / 4, 
              false, true, true, true  
            ); 
          } else if (part === 'rightUpperLeg' || part === 'rightUpperLegBack') {
              svgToSend = addSvgClipPath(
                svgString,
                svgW, svgH,
                svgW / 4, 
                true, false, true, true  
              ); 
          } else if (part === 'leftUpperArm' || part === 'leftUpperArmBack') {
            // round shoulder and elbow corners
             svgToSend = addSvgClipPath(
              svgString,
              svgW,svgH,
              svgW / 4, 
              false, false, false, false  
            );

          } else if (part === 'rightUpperArm' || part === 'rightUpperArmBack') {
            // round shoulder and elbow corners
             svgToSend = addSvgClipPath(
              svgString,
              svgW,svgH,
              svgW / 4, 
              false, false, false, false  
            );

          } else if (part === 'leftLowerArm' || part === 'leftLowerArmBack') {
            // round elbow and wrist corners
             svgToSend = addSvgClipPath(
              svgString,
              svgW,svgH,
              svgW / 4, 
              true, true, false, true  
            );
          } else if (part === 'rightLowerArm' || part === 'rightLowerArmBack') {
            // round elbow and wrist corners
             svgToSend = addSvgClipPath(
              svgString,
              svgW,svgH,
              svgW / 4, 
              false, true, true, false  
            );

          } else if (part === 'leftFoot' || part === 'rightFoot' || 
            part === 'leftFootBack' || part === 'rightFootBack') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW, svgH,
              svgW / 4, 
              true, true, false, false  
            ); 
          }

          if (part === 'leftUpperArm' || part === 'leftUpperArmBack' ||
              part === 'leftLowerArm' || part === 'leftLowerArmBack' ||
              part === 'rightUpperArm' || part === 'rightUpperArmBack' ||
              part === 'rightLowerArm' || part === 'rightLowerArmBack'       
          ) {
            // left edge strong -> right edge softer
            svgToSend = addSvgOpacityGradient(svgToSend, {
              direction: 'leftToRight',
              stops: [
                { offset: 0.0, opacity: 0.0 },
                { offset: 0.1, opacity: 0.25 },
                { offset: 0.15, opacity: 1.0 },
                { offset: 0.85, opacity: 1.0 },
                { offset: 0.9, opacity: 0.25 },
                { offset: 1.0, opacity: 0.0 },
              ],
              idSuffix: '_lua'
            });
          
          } else if  (
              part === 'leftUpperLeg' || part === 'leftUpperLegBack' ||
              part === 'rightUpperLeg' || part === 'rightUpperLegBack' ||
              part === 'leftLowerLeg' || part === 'leftLowerLegBack' ||
              part === 'rightLowerLeg' || part === 'rightLowerLegBack'
          ) {
            // left edge strong -> right edge softer
            svgToSend = addSvgOpacityGradient(svgToSend, {
              direction: 'topToBottom',
              stops: [
                { offset: 0.0, opacity: 0.0 },
                { offset: 0.1, opacity: 0.25 },
                { offset: 0.15, opacity: 1.0 },
                { offset: 0.85, opacity: 1.0 },
                { offset: 0.9, opacity: 0.25 },
                { offset: 1.0, opacity: 0.0 },
              ],
              idSuffix: '_lua'
            });
          
          }

          const img = await svgStringToImage(svgToSend);
          if (img) next[part] = img;
        } catch (e) {
          console.warn(`svgCanvas: failed to cache ${part}`, e);
        }
      }

      if (!cancelled) {
        imagesRef.current = next;
      }
    })();

    return () => { cancelled = true; };
  }, [svgs, torsoDimsRef]);

  return imagesRef;
}