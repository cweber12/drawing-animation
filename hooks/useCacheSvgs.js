// hooks/useCacheSvgs.js
import { useEffect, useRef } from 'react';
import { 
  getSvgDimensions, 
  addSvgClipPath, 
  svgStringToImage 
} from '../utils/svgUtils';
import { CANVAS_BORDER_RADIUS } from '../constants/Sizes';

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
export function useCacheSvgs(svgs, mapping) {
  const imagesRef = useRef({});

  useEffect(() => {
    console.log('svgCanvas: Caching SVG images');
    console.log('SVG parts:', Object.keys(svgs));
    console.log('SVG strings:', svgs);
    console.log('Mapping:', mapping);
    let cancelled = false;

    (async () => {
      const next = {};

      for (const [part, svgString] of Object.entries(svgs)) {
        if (typeof svgString !== 'string' || svgString.trim().length === 0) continue;

        try {
          const { width: svgW, height: svgH } = getSvgDimensions(svgString);
          let svgToSend;
          // addSvgClipPath(svgString, svgW, svgH, CANVAS_BORDER_RADIUS, topLeft, topRight, bottomRight, bottomLeft); 

          svgToSend = addSvgClipPath(
            svgString,
            svgW,
            svgH,
            CANVAS_BORDER_RADIUS,
            true, // topLeft
            true, // topRight
            true, // bottomRight
            true  // bottomLeft
          );
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
  }, [svgs, mapping]);

  return imagesRef;
}