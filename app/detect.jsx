/* app/detectPose.jsx
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
import DetectOptions from '../components/button_group/DetectOptions';
import ThemedView from '../components/view/ThemedView';
import DetectToolButtons from '../components/button_group/DetectToolButtons';

const DetectPose = () => {
  
  /* ===========================================================================
                            LOCAL VARIABLES AND REFS
  ============================================================================*/
  // Navigation and URL Params
  const navigation = useNavigation(); 
  const params = useLocalSearchParams();

  const { width: webcamWidth, height: webcamHeight } = getWebcamDimensions();

  const svgs = params.svgs ? JSON.parse(params.svgs) : {};
  const armOrientation = params.armOrientation;
  const videoUri = params.videoUri || null;
  //const viewMode = params.viewMode || 'replay'; 

  const webcamRef = useRef(null);
  const videoRef = useRef(null);
  const landmarksRef = useRef({ data: [], __token: 0 });

  const firstStartRef = useRef(true);
  
  /* ===========================================================================
                               STATE
  ============================================================================*/
  
  const [isTfReady, setIsTfReady] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [landmarks, setLandmarks] = useState([]); 
  const [isDetecting, setIsDetecting] = useState(false); 
  const [showWebcam, setShowWebcam] = useState(false); 
  const [showPoseAnimation, setShowPoseAnimation] = useState(false);
  const [showPoseInfo, setShowPoseInfo] = useState(false); 
  const [showDetectOptions, setShowDetectOptions] = useState(false);
  const [viewMode, setViewMode] = useState('replay');
  const [videoLoaded, setVideoLoaded] = useState(false);

  /* Natural video dimensions: used to transform landmarks to canvas coordinates
  ----------------------------------------------------------------------------*/
  const [naturalVideoWidth, setNaturalVideoWidth] = useState(null);
  const [naturalVideoHeight, setNaturalVideoHeight] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  /*============================================================================
                            CALLBACK FUNCTIONS
  ============================================================================*/

  /* Toggle Webcam Visibility ***REMOVE***
  ----------------------------------------------------------------------------*/
  const toggleWebcam = useCallback(() => {
    setShowWebcam(prev => !prev);
  }, []);

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
        navigation.setParams({ videoUri: videoURL, viewMode: 'replay' });
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

  /* ===========================================================================
                                   HOOKS
  ============================================================================*/
  
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
    }
  }, [videoUri]);
 
  /* Set navigation params for header buttons and state
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    navigation.setParams({
      onToggleWebcam: toggleWebcam,
      onToggleDetectOptions: toggleDetectOptions, 
      onDetectionStarted: () => {
        firstStartRef.current = false; 
        setShowPoseAnimation(false); 
        setIsDetecting(true); 
      },
      onDetectionStopped: () => {
        setIsDetecting(false); 
        if (!firstStartRef.current) setShowPoseAnimation(true); 
      },
      onShowPoseInfo: () => {
        setShowPoseInfo(prev => !prev);
      },
      onToggleExportOptions: toggleExportOptions,
      viewMode,
      showPoseAnimation,
      isDetecting,
    });
  }, [
    navigation,
    toggleWebcam,
    toggleDetectOptions,
    toggleExportOptions,
    setIsDetecting,
    setShowPoseAnimation,
    setShowPoseInfo,
    viewMode,
    showPoseAnimation,
    isDetecting,
  ]);

  /* Manage pose animation display based on isDetecting state
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (isDetecting) {
 
      setShowPoseAnimation(false); 
      firstStartRef.current = false; 
    } else if (!firstStartRef.current) {
      setShowPoseAnimation(true);
    }
  }, [isDetecting, viewMode]);

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
      <View style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10,
        }}>
      
        {showDetectOptions && (
            <DetectOptions
                onPickVideo={handlePickVideo}
                setPoseView={() => {
                    setViewMode('replay');
                    setShowDetectOptions(false);

                }}
                setSvgView={() => {
                    setViewMode('live');
                    setShowDetectOptions(false);
                }}
            />
        )}
      </View>
       

        

      <View 
        style={{ 
          position: 'relative', 
          width: CANVAS_WIDTH, 
          height: CANVAS_HEIGHT 
          }}>
          {showExportOptions && (
            <ExportLandmarkDropdown
              onDownloadLandmarksToDevice={handleDownloadLandmarksToDevice}
              onUploadToS3={handleUploadToS3}
            />
          )}
          {showPoseInfo && <PoseInfo />}

          <PoseCanvas
            width={
              viewMode === 'replay'
                ? (videoUri
                    ? CANVAS_WIDTH
                    : naturalVideoWidth || CANVAS_WIDTH)
                : webcamWidth
            }
            height={
              viewMode === 'replay'
                ? (videoUri
                    ? CANVAS_HEIGHT
                    : naturalVideoHeight || CANVAS_HEIGHT)
                : webcamHeight
            }
            landmarks={landmarks}
            landmarksRef={landmarksRef}
            viewMode={viewMode}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: 3,
              width: viewMode === 'replay' ? CANVAS_WIDTH : webcamWidth,
              height: viewMode === 'replay' ? CANVAS_HEIGHT : webcamHeight,
              background: 'rgba(0,0,0,0.1)',
            }}
          />
          
          {(viewMode === 'live' || showPoseAnimation) && svgs && (
            <SvgCanvas
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              webcamWidth={webcamWidth}
              webcamHeight={webcamHeight}
              landmarks={landmarks}
              replay={showPoseAnimation}
              svgs={svgs}
              armOrientation={armOrientation}
              videoLoaded={videoLoaded}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 1,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                background: 'rgba(0,0,0,0.3)', 
              }}
            />

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
          
          {viewMode === 'replay' && videoUri && (
            <View style={styles.toolWrapper}>
              <DetectToolButtons
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
              />
            </View> 
          )}    
          
          {(viewMode === 'live' || showWebcam) && (
            <Webcam
              ref={webcamRef}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 2,
                visibility: showWebcam ? 'visible' : 'hidden',
                width: viewMode === 'replay' ? CANVAS_WIDTH : webcamWidth,
                height: viewMode === 'replay' ? CANVAS_HEIGHT : webcamHeight,
              }}
              videoConstraints={{
                width: viewMode === 'replay' ? CANVAS_WIDTH : webcamWidth,
                height: viewMode === 'replay' ? CANVAS_HEIGHT : webcamHeight,
                facingMode: 'user',
              }}
            />
          )}
        </View>  
    </ThemedView>
  );
};

export default DetectPose;

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
  }
});