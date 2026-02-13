// app/viewSavedPoses.jsx

/* View Saved Animations Page
--------------------------------------------------------------------------------
A page for viewing saved pose landmark files and SVG sketches. Landmarks can be
selected and rendered as an animation, and SVGs can be overlaid on the landmarks.
------------------------------------------------------------------------------*/
import {
  ActivityIndicator,
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  useColorScheme,
  Text, 
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from 'expo-router';
import { GiSkeletonInside } from "react-icons/gi";
import { ANCHOR_MAP } from '../constants/descriptors/anchorDescriptors';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';
import { Colors } from '../constants/Colors';
import { scaleLandmarkFrames } from '../utils/poseUtils';

import SvgCanvas from '../components/canvas/SvgCanvas';
import ThemedView from '../components/view/ThemedView';
import PoseCanvas from '../components/canvas/PoseCanvas';
import ShiftControls from '../components/dropdown/svg_controls/ShiftControls';
import ScaleControls from '../components/dropdown/svg_controls/ScaleControls';

import { MdSwitchLeft, MdSwitchRight } from "react-icons/md";

// IMPORTANT: adjust this path if your FileList is in a different folder
import FileList from '../components/list/FileList';

const ViewSavedPoses = () => {
  const navigation = useNavigation();
  const window = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  /*============================================================================
                                STATE
  ============================================================================*/
  // Video dimensions from loaded landmark file
  const [videoDimensions, setVideoDimensions] = useState({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  // Canvas dimensions
  const [width, setWidth] = useState(CANVAS_WIDTH);
  const [height, setHeight] = useState(CANVAS_HEIGHT);

  // Loading and file selection state
  const [loading, setLoading] = useState(false);
  const [selectedLandmarkFile, setSelectedLandmarkFile] = useState(null);
  const [selectedSvgFile, setSelectedSvgFile] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Lists of files
  const [files, setFiles] = useState([]);

  // Frames and landmark data
  const [frames, setFrames] = useState([]);
  const [scaledFrames, setScaledFrames] = useState([]);
  const [landmarkFiles, setLandmarkFiles] = useState([]);

  // SVG data
  const [svgFiles, setSvgFiles] = useState([]);
  const [selectedSvgString, setSelectedSvgString] = useState(null);

  // Conditional rendering and file loading (S3 or device)
  const [showDeviceFiles, setShowDeviceFiles] = useState(false);

  const [showShiftControls, setShowShiftControls] = useState(true);
  const [showScaleControls, setShowScaleControls] = useState(false);

  const [controlIconHovered, setControlIconHovered] = useState(false);

  const [debugAnchors, setDebugAnchors] = useState(false);

  // Ref for animation interval
  const animationRef = useRef(null);

  /*============================================================================
                                EFFECTS
  ============================================================================*/

  /* HANDLE ANIMATION PLAYBACK
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (!frames.length || frames.length === 1) return;

    if (animationRef.current) clearInterval(animationRef.current);

    setCurrentFrame(0);
    animationRef.current = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 60);

    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, [frames]);

  /* UPDATE NAVIGATION PARAMS
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    navigation.setParams({
      title: showDeviceFiles ? 'Device Animations' : 'S3 Animations',
      showDeviceFiles,
      onSetShowDeviceFiles: () => setShowDeviceFiles((prev) => !prev),
    });
  }, [navigation, showDeviceFiles]);

  /* PRECOMPUTE SCALED FRAMES
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (!frames || frames.length === 0) {
      setScaledFrames([]);
      return;
    }

    try {
      const scaled = scaleLandmarkFrames(frames, videoDimensions, { width, height });
      setScaledFrames(scaled);
    } catch (e) {
      console.error('Scaling frames failed:', e);
      setScaledFrames([]);
    }
  }, [frames, videoDimensions.width, videoDimensions.height, width, height]);

  /*============================================================================
                                RENDER
  ============================================================================*/
  return (
      <ThemedView style={styles.mainContainer}>
        
        <View 
          style={{ 
            flexDirection: 'column',  
            minWidth: 240, position: 'absolute', top: 24, right: 24, zIndex: 10
            }}>
            <View 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 8, 
                backgroundColor: theme.listItemBackgroundPressed,
                }}>
              <Text 
                style={{ 
                  color: theme.text, 
                  fontFamily: 'Segoe UI', 
                  fontSize: 16 
                  }}>
                {showShiftControls ? 'Shift Anchors' : 'Scale Parts'}
              </Text>
              <TouchableOpacity
                onPress={() => (
                  setShowShiftControls((prev) => !prev), 
                  setShowScaleControls((prev) => !prev)
                )}
                onMouseEnter={() => setControlIconHovered(true)}
                onMouseLeave={() => setControlIconHovered(false)}
              >
                {showShiftControls ? (
                  <MdSwitchLeft 
                    size={38} 
                    color={controlIconHovered ? theme.iconHover : theme.icon} /> ) : ( 
                  <MdSwitchRight 
                    size={38} 
                    color={controlIconHovered ? theme.iconHover : theme.icon} /> 
                  )}
              </TouchableOpacity>
            </View>
          {showScaleControls && <ScaleControls />}
          {showShiftControls && <ShiftControls />}
          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 12,
              height: 48,
              paddingHorizontal: 32,
              backgroundColor: theme.listItemBackground,
              borderRadius: 4,
              cursor: 'pointer',
            }}
            onPress={() => setDebugAnchors((prev) => !prev)}
          >
            <Text 
            style={{ 
              color: theme.text, 
              fontFamily: 'Segoe UI', 
              fontSize: 18, 
              fontWeight: 'bold'
              }}>
              {debugAnchors ? 'Hide Anchors' : 'Show Anchors'}
            </Text> 
            <GiSkeletonInside 
              size={32} 
              style={{ marginLeft: 6}}
              color={debugAnchors ? theme.actionButton : theme.text}
             />
          </TouchableOpacity>
        </View>

        <FileList
          // file lists + selections
          files={files}
          setFiles={setFiles}
          landmarkFiles={landmarkFiles}
          setLandmarkFiles={setLandmarkFiles}
          svgFiles={svgFiles}
          setSvgFiles={setSvgFiles}
          selectedLandmarkFile={selectedLandmarkFile}
          setSelectedLandmarkFile={setSelectedLandmarkFile}
          selectedSvgFile={selectedSvgFile}
          setSelectedSvgFile={setSelectedSvgFile}
          selectedSvgString={selectedSvgString}
          setSelectedSvgString={setSelectedSvgString}
          // frames/canvas/video state
          frames={frames}
          setFrames={setFrames}
          currentFrame={currentFrame}
          setCurrentFrame={setCurrentFrame}
          videoDimensions={videoDimensions}
          setVideoDimensions={setVideoDimensions}
          setHeight={setHeight}
          setWidth={setWidth}
          window={window}
          // source mode + loading + cleanup
          showDeviceFiles={showDeviceFiles}
          setShowDeviceFiles={setShowDeviceFiles}
          loading={loading}
          setLoading={setLoading}
          animationRef={animationRef}
        />

        {/* Canvas Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading && <ActivityIndicator />}

          {selectedLandmarkFile && selectedSvgString && (
            <SvgCanvas
              width={width}
              height={height}
              webcamWidth={videoDimensions.width}
              webcamHeight={videoDimensions.height}
              landmarks={null}
              savedLandmarks={scaledFrames}
              replay={frames.length > 1}
              svgs={selectedSvgString}
              mapping={ANCHOR_MAP}
              armOrientation="horizontal"
              debugAnchorsFlag={debugAnchors}
            />
          )}

          {frames.length > 0 && selectedLandmarkFile && !selectedSvgFile && (
            <PoseCanvas
              width={width}
              height={height}
              landmarks={scaledFrames?.[currentFrame] ?? null}
              savedLandmarks={scaledFrames}
            />
          )}
        </div>
      </ThemedView>
  );
};

export default ViewSavedPoses;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 24,
  },
});