// components/canvas/SvgCanvas.jsx

import React, { useRef, useEffect, useState } from 'react';
import { useCacheSvgs } from '../../hooks/useCacheSvgs';
import TorsoDimensions  from '../../utils/TorsoDimensions';
import EarDistance from '../../utils/EarDistance';
import { useSetAnchorsAndDraw } from '../../hooks/useSetAnchorsAndDraw';

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
  savedLandmarks = [], // saved landmarks for replay
  replay, // whether in replay mode
  svgs = {}, // original SVG strings
  mapping = {}, // body part to landmark index mapping
  armOrientation, // extended horizintal (large screen) or vertical (mobile)
  style
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
  // Animation frame state for pose replay
  const [frame, setFrame] = useState(0);

  /* Choose which landmarks to use for drawing
  ------------------------------------------------------------------------------
  replay: saved landmarks loaded and used as svg anchors (load all and iterate)
  !replay (live): current landmarks used as svg anchors (from webcam input)
  ----------------------------------------------------------------------------*/
  const displayLandmarks =
    replay && savedLandmarks.length > 0
      ? savedLandmarks[frame]
      : landmarks;

  /*============================================================================
                              HOOKS
  ============================================================================*/
  /* CACHE SVG IMAGES
  ------------------------------------------------------------------------------
  Uses useCacheSvgs hook to convert SVG strings into Image objects for drawing
  svgs(string) -> cachedSvgsRef(Image objects)
  ----------------------------------------------------------------------------*/
  const cachedSvgsRef = useCacheSvgs(svgs, mapping, torsoDimsRef);
  
  /* ANIMATE THROUGH SAVED LANDMARKS
  ------------------------------------------------------------------------------
  When replay is active (saved landmarks being replayed): 
    Update frame at fixed interval (30 FPS)
    savedLandmarks[frame] -> displayLandmarks -> useSetAnchorsAndDraw -> render
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (replay && savedLandmarks.length > 0) {
      setFrame(0);
      const interval = setInterval(() => {
        setFrame(prev => (prev + 1) % savedLandmarks.length);
      }, 1000 / 24); // 24 FPS
      return () => clearInterval(interval);
    }
    setFrame(0);
  }, [replay, savedLandmarks.length]);

  /* SET ANCHORS AND DRAW SVGs
  ------------------------------------------------------------------------------
  Uses useSetAnchorsAndDraw hook to set SVG anchor points based on landmarks 
  and draws the body part svgs onto the canvas in the correct position based on 
  anchors defined by (x,y) coordinates of displayLandmarks.
  ----------------------------------------------------------------------------*/
  useSetAnchorsAndDraw({
    canvasRef, // ref to the canvas element
    imagesRef: cachedSvgsRef, // ref to cached SVG Image objects
    width, height, // canvas dimensions
    displayLandmarks, // landmarks to use for setting anchors
    replay, // whether in replay mode
    scaleWebcamX, scaleWebcamY, // scaling factors from webcam to canvas size
    mapping, // body part to landmark index mapping
    svgs, // original SVG strings
    armOrientation, // horizontal or vertical arm orientation
    torsoDimsRef, // ref to torso dimensions utility for dynamic scaling
    earDistRef, // ref to ear distance utility for head scaling
  });

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