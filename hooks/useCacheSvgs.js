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
          } else if (part === 'head') {
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
          } else if (part === 'leftLowerLeg' || part === 'rightLowerLeg') {
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
          } else if (part === 'leftUpperLeg') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW, svgH,
              svgW / 4, 
              false, true, true, true  
            ); 
          } else if (part === 'rightUpperLeg') {
              svgToSend = addSvgClipPath(
                svgString,
                svgW, svgH,
                svgW / 2, 
                true, false, true, true  
              ); 
          } else if (part === 'leftUpperArm' ) {
            // round shoulder and elbow corners
             svgToSend = addSvgClipPath(
              svgString,
              svgW,svgH,
              svgW / 4, 
              false, false, false, false  
            );

          } else if (part === 'rightUpperArm' ) {
            // round shoulder and elbow corners
             svgToSend = addSvgClipPath(
              svgString,
              svgW,svgH,
              svgW / 4, 
              false, false, false, false  
            );

          } else if (part === 'leftLowerArm' ) {
            // round elbow and wrist corners
             svgToSend = addSvgClipPath(
              svgString,
              svgW,svgH,
              svgW / 2, 
              true, true, false, true  
            );
          } else if (part === 'rightLowerArm' ) {
            // round elbow and wrist corners
             svgToSend = addSvgClipPath(
              svgString,
              svgW,svgH,
              svgW / 2, 
              false, true, true, false  
            );

          } else if (part === 'leftFoot' || part === 'rightFoot') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW, svgH,
              svgW / 4, 
              true, true, false, false  
            ); 
          }

          if (part === 'leftUpperArm') {
            // left edge strong -> right edge softer
            svgToSend = addSvgOpacityGradient(svgToSend, {
              direction: 'leftToRight',
              stops: [
                { offset: 0.0, opacity: 0.0 },
                { offset: 0.1, opacity: 0.25 },
                { offset: 0.25, opacity: 1.0 },
                { offset: 0.75, opacity: 1.0 },
                { offset: 0.9, opacity: 0.25 },
                { offset: 1.0, opacity: 0.0 },
              ],
              idSuffix: '_lua'
            });
          } else if (part === 'rightUpperArm') {
            // mirror for right arm
            svgToSend = addSvgOpacityGradient(svgToSend, {
              direction: 'rightToLeft',
              stops: [
                { offset: 0.0, opacity: 0.0 },
                { offset: 0.1, opacity: 0.45 },
                { offset: 0.25, opacity: 1.0 },
                { offset: 0.75, opacity: 1.0 },
                { offset: 0.9, opacity: 0.45 },
                { offset: 1.0, opacity: 0.0 },
              ],
              idSuffix: '_rua'
            });
          } else if (part === 'leftLowerArm') {
            svgToSend = addSvgOpacityGradient(svgToSend, {
              direction: 'leftToRight',
              stops: [
                { offset: 0.0, opacity: 0.9 },
                { offset: 1.0, opacity: 0.7 },
              ],
              idSuffix: '_lla'
            });
          } else if (part === 'rightLowerArm') {
            svgToSend = addSvgOpacityGradient(svgToSend, {
              direction: 'rightToLeft',
              stops: [
                { offset: 0.0, opacity: 0.9 },
                { offset: 1.0, opacity: 0.7 },
              ],
              idSuffix: '_rla'
            });
          } else if (part === 'leftUpperLeg') {
            svgToSend = addSvgOpacityGradient(svgToSend, {
              direction: 'leftToRight',
              stops: [
                { offset: 0.0, opacity: 0.9 },
                { offset: 1.0, opacity: 0.7 },
              ],
              idSuffix: '_lul'
            });
          } else if (part === 'rightUpperLeg') {
            svgToSend = addSvgOpacityGradient(svgToSend, {
              direction: 'rightToLeft',
              stops: [
                { offset: 0.0, opacity: 0.9 },
                { offset: 1.0, opacity: 0.7 },
              ],
              idSuffix: '_rul'
            });
          } else if (part === 'torso') {
            svgToSend = addSvgOpacityGradient(svgToSend, {
              direction: 'topToBottom',
              stops: [
                { offset: 0.0, opacity: 0.9 },
                { offset: 1.0, opacity: 0.7 },
              ],
              idSuffix: '_torso'
            });
          }
          console.log(`Caching SVG for ${part} with dimensions ${svgW}x${svgH}`);
          console.log(`SVG string with clip path: ${svgToSend}`);
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