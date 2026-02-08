// hooks/useCacheSvgs.js
import { useEffect, useRef } from 'react';
import { 
  getSvgDimensions, 
  addSvgClipPath, 
  svgStringToImage 
} from '../utils/svgUtils';
import { CANVAS_BORDER_RADIUS } from '../constants/Sizes';
import { add } from 'lodash';
/* Hook to cache SVG images from SVG strings
--------------------------------------------------------------------------------
Takes in an object of SVG strings and returns a ref containing loaded Image
objects for each SVG part.
Props | svgs : object containing SVG strings
      | mapping : object mapping body parts to landmark indices (not used here 
      | but kept for consistency)
--------------------------------------------------------------------------------      
Returns | ref with cached Image objects
------------------------------------------------------------------------------*/
export function useCacheSvgs(svgs, mapping, torsoDimsRef) {
  const imagesRef = useRef({});
  const torsoDims = torsoDimsRef?.current;
  useEffect(() => {
    console.log('svgCanvas: Caching SVG images');
    console.log('SVG parts:', Object.keys(svgs));
    console.log('SVG strings:', svgs);
    console.log('Mapping:', mapping);
    let cancelled = false;
    let roundCorners = true; // Set to true to enable rounded corners on SVGs
    (async () => {
      const next = {};

      for (const [part, svgString] of Object.entries(svgs)) {
        if (typeof svgString !== 'string' || svgString.trim().length === 0) continue;
        
        try {
          const { width: svgW, height: svgH } = getSvgDimensions(svgString);
          let svgToSend = svgString;
          
          if (part === 'torso') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW,
              svgH,
              svgW / 4, // radius
              true, //TL
              true, //TR
              false, //BR
              false  //BL
            );
          } else if (part === 'head') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW,
              svgH,
              svgW / 2, // radius
              false, //TL
              false, //TR
              true, //BR
              true  //BL
            ); 
          } else if (part === 'leftLowerLeg' || part === 'rightLowerLeg') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW,
              svgH,
              svgW / 2, // radius
              true, //TL
              true, //TR
              true, //BR
              true  //BL
            ); 
          } else if (part === 'leftUpperLeg' || part === 'rightUpperLeg') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW, svgH,
              svgW / 2, 
              false, false, true, true  
            ); 
          } else if (part === 'leftUpperArm' ) {
            // round shoulder and elbow corners
             svgToSend = addSvgClipPath(
              svgString,
              svgW,svgH,
              svgW / 2, 
              false, true, true, true  
            );

          } else if (part === 'rightUpperArm' ) {
            // round shoulder and elbow corners
             svgToSend = addSvgClipPath(
              svgString,
              svgW,svgH,
              svgW / 2, 
              true, true, true, true  
            );
 
          } else if (part === 'leftFoot' || part === 'rightFoot') {
            svgToSend = addSvgClipPath(
              svgString,
              svgW, svgH,
              svgW / 2, 
              true, true, false, false  
            ); 
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
  }, [svgs, mapping, torsoDimsRef]);

  return imagesRef;
}