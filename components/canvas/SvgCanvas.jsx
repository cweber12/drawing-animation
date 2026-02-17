// components/canvas/SvgCanvas.jsx

import React, { useRef, useEffect, useState } from 'react';
import { useCacheSvgs } from '../../hooks/useCacheSvgs';
import TorsoDimensions  from '../../utils/TorsoDimensions';
import EarDistance from '../../utils/EarDistance';
import { useSetAnchorsAndDraw } from '../../hooks/useSetAnchorsAndDraw';
import { useLandmarks } from '../../context/LandmarksContext';

/*==============================================================================
                          SVG CANVAS COMPONENT
================================================================================
Renders a canvas that draws body part SVGs at positions defined by pose
landmarks. Supports live drawing from webcam landmarks or replaying saved
landmarks.
------------------------------------------------------------------------------*/
const SvgCanvas = ({ 
  width, height, // canvas dimensions
  webcamWidth, webcamHeight, // webcam video dimensions (live)
  landmarks, // current pose landmarks (live)
  replay, // whether in replay mode
  svgs = {}, // original SVG strings
  armOrientation, // extended horizintal (large screen) or vertical (mobile)
  style, 
  debugAnchorsFlag,
}) => {

  /*============================================================================
                              CONSTANTS AND REFS
  ============================================================================*/
  // Scaling factors from webcam to canvas size
  const scaleWebcamX = width / webcamWidth;
  const scaleWebcamY = height / webcamHeight;
  const canvasRef = useRef(null);
  const torsoDimsRef = useRef(new TorsoDimensions());
  const earDistRef = useRef(new EarDistance());
  const { processedRef, processedVersion } = useLandmarks();
  const [frame, setFrame] = useState(0);
  
  /*============================================================================
                              HOOKS
  ============================================================================*/
  /* CACHE SVG IMAGES
  ----------------------------------------------------------------------------*/
  const cachedSvgsRef = useCacheSvgs(svgs, torsoDimsRef);

  /* DRAW / SET ANCHORS HOOK (call at top-level only)
  ---------------------------------------------------------------------------*/
  useSetAnchorsAndDraw({
    canvasRef,
    imagesRef: cachedSvgsRef,
    width, height,
    processedLandmarks: processedRef?.current?.[frame],
    processedVersion,
    replay,
    scaleWebcamX, scaleWebcamY,
    svgs,
    armOrientation,
    torsoDimsRef,
    earDistRef,
    debugAnchorsFlag,
  });
  
  /* ANIMATE THROUGH SAVED LANDMARKS
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (processedRef?.current && processedRef.current.length > 0) {
      setFrame(0);
      const interval = setInterval(() => {
        setFrame(prev => (prev + 1) % (processedRef.current.length || 1));
      }, 1000 / 30);
      return () => clearInterval(interval);
    }
    setFrame(0);
  }, [processedVersion]);
  
  /* ANIMATE THROUGH SAVED LANDMARKS
  ------------------------------------------------------------------------------
  When in replay mode, use useSetAnchorsAndDraw to draw the SVGs at positions
  defined by the current frame's landmarks. 
  ----------------------------------------------------------------------------*/
  


  /* RENDER CANVAS
  ----------------------------------------------------------------------------*/
  return (
    <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
            width,
            height,
            pointerEvents: 'none',
            backgroundColor: 'transparent', 
            ...style,
        }}
    />
  );
};

export default SvgCanvas;