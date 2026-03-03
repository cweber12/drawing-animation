/* app/capture.jsx
----------------------------------------------------------------------------------------------------
This page uses TensorFlow.js to detect human poses from the webcam feed and uses detected pose
landmarks as anchors to overlay SVGs body parts sketched in sketchPage. It supports two view 
modes:

- 'live': Live animation mode where SVGs are animated in real-time based on detected poses.
- 'replay': Pose recording mode where detected poses are recorded and can be replayed as an animation.
--------------------------------------------------------------------------------------------------*/
/* Imports
------------------------------------------------------------------------------*/
// Libraries and React
import React, { useEffect,  useRef, useState,  useCallback} from 'react';
import Webcam from 'react-webcam';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
// Constants
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  getWebcamDimensions 
} from '../constants/Sizes';
// Utils and Hooks
import { downloadLandmarksToDevice } from '../utils/storage/storageUtils';
import { uploadToS3 } from '../utils/storage/s3Utils';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { useLandmarks } from '../context/LandmarksContext';
// Components
import SvgCanvas from '../components/canvas/SvgCanvas';
import PoseCanvas from '../components/canvas/PoseCanvas';
import ExportLandmarkDropdown from '../components/dropdown/select/ExportLandmarkDropdown';
import PoseInfo from '../components/dropdown/info/PoseInfo';
import CaptureOptionButtons from '../components/button_group/CaptureOptionButtons';
import ThemedView from '../components/view/ThemedView';
import CaptureToolButtons from '../components/button_group/CaptureToolButtons';

const Capture = () => {
  
  /* CONSTANTS AND REFS
  ============================================================================*/
  const { width: webcamWidth, height: webcamHeight } = getWebcamDimensions();
  const navigation = useNavigation(); 
  const params = useLocalSearchParams();
  const svgs = params.svgs ? JSON.parse(params.svgs) : {};
  const armOrientation = params.armOrientation;

  const webcamRef = useRef(null);
  const videoRef = useRef(null);
  const landmarksRef = useRef({ data: [], __token: 0 });

  const firstStartRef = useRef(true);

  const { clearOriginals, clearProcessed } = useLandmarks();

  /* STATE 
  ============================================================================*/
  const [isTfReady, setIsTfReady] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [landmarks, setLandmarks] = useState([]); 
  const [isDetecting, setIsDetecting] = useState(false); 
  const [viewMode, setViewMode] = useState('replay');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoUri, setVideoUri] = useState(params.videoUri || null);
  const [naturalVideoWidth, setNaturalVideoWidth] = useState(null);
  const [naturalVideoHeight, setNaturalVideoHeight] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false); 
  const [showPoseAnimation, setShowPoseAnimation] = useState(false);
  const [showPoseInfo, setShowPoseInfo] = useState(false); 
  const [showDetectOptions, setShowDetectOptions] = useState(true);

  /*============================================================================
                            CALLBACK FUNCTIONS
  ============================================================================*/

  /* Toggle Export Options Dropdown
  ----------------------------------------------------------------------------*/
  const toggleExportOptions = useCallback(() => {
    setShowExportOptions(prev => !prev);
  }, []);

  const toggleDetectOptions = useCallback(() => {
    setShowDetectOptions(prev => !prev);
  }, []);

  /* Handle video file selection for replay mode
  ----------------------------------------------------------------------------*/
  const handlePickVideo = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const videoURL = URL.createObjectURL(file);
        setVideoUri(videoURL);
        setViewMode('replay');
        setShowWebcam(false);
      }
    };
    input.click();
    setShowDetectOptions(false);
  }, [navigation]);

  /* Download saved landmarks to device
  ----------------------------------------------------------------------------*/
  const handleDownloadLandmarksToDevice = useCallback(() => {
    downloadLandmarksToDevice();
  }, []);

  /* Upload saved landmarks to S3
  ----------------------------------------------------------------------------*/
  const handleUploadToS3 = useCallback(() => {
    uploadToS3();
  }, []);

  const handlePageReset = useCallback(() => {
    console.log('Resetting page and clearing landmarks');
    setLandmarks([]);
    landmarksRef.current = { data: [], __token: 0 };
    clearOriginals();
    clearProcessed();
    setVideoUri(null);
    setShowPoseAnimation(false);
    setIsDetecting(false);
    setShowWebcam(false);
    setShowPoseInfo(false);
    setShowDetectOptions(true);
    setShowExportOptions(false);
    setViewMode('replay');
  }, []);

  /* ===========================================================================
                                   EFFECTS
  ============================================================================*/
  
  useEffect(() => {
    setLandmarks([]);
    landmarksRef.current = { data: [], __token: 0 };
    clearOriginals();
    clearProcessed();
  }, []);
  
  /* Load TensorFlow.js and Pose Detection Model
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await tf.setBackend('webgl'); // set backend to webgl for better performance
      await tf.ready(); // wait for the model to be ready
      if (!cancelled) setIsTfReady(true); // update state only if not cancelled
    })();
    return () => {
      cancelled = true; // cleanup on unmount
    };
  }, []);
  
  /* Update isDetecting based on viewMode
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (viewMode === 'live') {
      setIsDetecting(true); 
    }
  }, [viewMode]);

  /* Set videoLoaded to true when videoUri is provided
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (videoUri) {
      setVideoLoaded(true);
      setLandmarks([]);
      landmarksRef.current = { data: [], __token: 0 };
      console.log('Video URI changed, resetting landmarks');
    }
  }, [videoUri]);
 
  /* Set navigation params for header buttons and state
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    navigation.setParams({
      onToggleDetectOptions: toggleDetectOptions, 
      onShowPoseInfo: () => {
        setShowPoseInfo(prev => !prev);
      },
      viewMode,
    });
  }, [
    navigation,
    toggleDetectOptions,
    setShowPoseInfo,
    viewMode,
  ]);

  /* Manage pose animation display based on isDetecting state
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (isDetecting && viewMode === 'replay') {
      setShowPoseAnimation(false); 
      firstStartRef.current = false; 
    } else if (!firstStartRef.current) {
      setShowPoseAnimation(true);
    }
  }, [isDetecting, viewMode]);

  useEffect(() => {
    if (viewMode ==='live') {
      firstStartRef.current = false; 
      setShowPoseAnimation(false);
      setIsDetecting(true);
    }
  }, [viewMode]);

  /* Custom hook to run pose detection
  ----------------------------------------------------------------------------*/
  usePoseDetection({
    isTfReady,
    isDetecting,
    videoUri,
    videoRef,
    webcamRef,
    videoLoaded,
    naturalVideoWidth,
    naturalVideoHeight,
    setLandmarks,
    setLoading,
    viewMode,
    landmarksRef,
  });

  if (!isTfReady || loading) {
    return (
      <div>
        <div style={styles.notificationText}>Loading pose model...</div>
      </div>
    );
  }

  return (
     <ThemedView >
      <View style={styles.dropdownLeft}>      
        {showDetectOptions && (
            <CaptureOptionButtons
                onPickVideo={handlePickVideo}
                setReplay={() => {
                    setViewMode('replay');
                    setShowDetectOptions(false);
                    setShowWebcam(true);
                }}
                setLive={() => {
                    setViewMode('live');
                    setShowDetectOptions(false);
                    setShowWebcam(true);
                    setIsDetecting(true);
                    setShowPoseAnimation(true);
                }}
            />
        )}
      </View>
      <View style={styles.dropdownLeft}>
        {showPoseInfo && <PoseInfo />}
      </View>
       
      <View style={{ position: 'relative',  width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
          {showExportOptions && (
            <ExportLandmarkDropdown
              onDownloadLandmarksToDevice={handleDownloadLandmarksToDevice}
              onUploadToS3={handleUploadToS3}
            />
          )}

          {viewMode === 'replay' && (
          <PoseCanvas
            width={videoUri ? CANVAS_WIDTH : naturalVideoWidth || CANVAS_WIDTH}
            height={videoUri? CANVAS_HEIGHT: naturalVideoHeight || CANVAS_HEIGHT}
            landmarks={landmarks}
            landmarksRef={landmarksRef}
            viewMode={viewMode}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: 3,
            }}
          />
          )}
          
          {(viewMode === 'live' || showPoseAnimation) && (
            <SvgCanvas
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              webcamWidth={webcamWidth}
              webcamHeight={webcamHeight}
              landmarks={landmarks}
              landmarksRef={landmarksRef}
              replay={showPoseAnimation}
              svgs={svgs}
              armOrientation={armOrientation}
              videoLoaded={videoLoaded}
              viewMode={viewMode}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 1,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,

              }}
            />

          )}

           {viewMode ==='replay' && !showPoseAnimation && (videoUri || showWebcam ) && (
           <View style={styles.toolWrapper}>
              <CaptureToolButtons
                onDetectionStarted={() => {
                  firstStartRef.current = false; 
                  setShowPoseAnimation(false); 
                  setIsDetecting(true); 
                }}
                onDetectionStopped={() => {
                  setIsDetecting(false);
                  if (!firstStartRef.current) setShowPoseAnimation(true);
                }}
                viewMode={viewMode}
                isDetecting={isDetecting}
                onToggleExportOptions={() => setShowExportOptions(prev => !prev)}
                onReset={handlePageReset}
              />
            </View>
          )}

          {videoUri && !showPoseAnimation && (            
              <video
                ref={videoRef}
                src={videoUri}
                controls
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  zIndex: 2,
                  height: CANVAS_HEIGHT,
                  width: CANVAS_WIDTH,
                  
                  background: '#000',
                }}
                onLoadedMetadata={() => {
                  const video = videoRef.current;
                  if (video) {
                    setNaturalVideoWidth(video.videoWidth);
                    setNaturalVideoHeight(video.videoHeight);
                    video.play();
                  }
                  setVideoLoaded(true);
                }}
              />
          )}
                   
          {showWebcam && (
            <Webcam
              ref={webcamRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: viewMode === 'live' ? -10 : 1,
                visibility: viewMode === 'live' ? 'hidden' : 'visible',
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
              }}
              videoConstraints={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                facingMode: 'user',
              }}
            />
          )}
        </View>  
    </ThemedView>
  );
};

export default Capture;

const styles = StyleSheet.create({
 
  notificationText: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'segoe-ui',
  },

  toolWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  }, 

  dropdownLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
});