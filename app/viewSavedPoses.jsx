// app/viewSavedPoses.jsx

/* View Saved Animations Page
--------------------------------------------------------------------------------
A page for viewing saved pose landmark files and SVG sketches. Landmarks can be 
selected and rendered as an animation, and SVGs can be overlaid on the landmarks.
------------------------------------------------------------------------------*/
import { 
  ActivityIndicator, 
  TouchableOpacity, 
  Text,
  View, 
  StyleSheet, 
  FlatList, 
  useWindowDimensions, 
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from 'expo-router';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { CANVAS_LANDMARK_MAP } from '../constants/landmarkData';
import { fetchFiles, downloadLandmarkFile, downloadSvgFile } from '../utils/s3Utils';
import {
  selectPoseFolder,
  listDevicePoseFiles,
  readDeviceFileText,
} from "../utils/storageUtils";

import { FaPencilAlt } from "react-icons/fa";
import { GiSkeleton, GiShamblingZombie } from "react-icons/gi";
import SvgCanvas from '../components/canvas/SvgCanvas';
import ThemedView from '../components/view/ThemedView';
import PoseCanvas from '../components/canvas/PoseCanvas';
import DropdownSelect from '../components/button/DropdownSelect';
import { BsPersonRaisedHand } from "react-icons/bs";


const ViewSavedPoses = () => {
  
  const navigation = useNavigation();
  const window = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  
  /*============================================================================
                                STATE 
  ============================================================================*/
  // Video dimensions from loaded landmark file
  const [videoDimensions, setVideoDimensions] = 
    useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

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
  const [landmarkFiles, setLandmarkFiles] = useState([]);
  // SVG data
  const [svgFiles, setSvgFiles] = useState([]);
  const [selectedSvgString, setSelectedSvgString] = useState(null);
  // Conditional rendering and file loading (S3 or device)
  const [showDeviceFiles, setShowDeviceFiles] = useState(false);

  /*============================================================================
                             REFS
  ============================================================================*/
  const animationRef = useRef(null);

  /*============================================================================
                            FUNCTIONS
  ============================================================================*/
  
  /* Scale landmarks to fit target dimensions
  ----------------------------------------------------------------------------*/
  function scaleLandmarks(landmarks, original, target) {
    if (!landmarks || !Array.isArray(landmarks)) return [];
    const { width: origW, height: origH } = original;
    const { width: targetW, height: targetH } = target;
    return landmarks.map(kp =>
      kp && kp.x != null && kp.y != null
        ? {
            ...kp,
            x: (kp.x / origW) * targetW,
            y: (kp.y / origH) * targetH,
          }
        : kp
    );
  }

  /* Choose device folder and load files
  ----------------------------------------------------------------------------*/
  const chooseDeviceFolderAndLoad = async () => {
    setLoading(true);
    try {
      const ok = await selectPoseFolder();
      if (!ok) return;
      setShowDeviceFiles(true);
      // reset selections
      setSelectedLandmarkFile(null);
      setSelectedSvgFile(null);
      setFrames([]);
      setSelectedSvgString(null);
      setLandmarkFiles([]);
      setSvgFiles([]);

      const { landmarkFiles, svgFiles } = await listDevicePoseFiles();
      setLandmarkFiles(landmarkFiles);
      setSvgFiles(svgFiles);
    } catch (e) {
      console.error(e);
      setLandmarkFiles([]);
      setSvgFiles([]);
    } finally {
      setLoading(false);
    }
  };

  /* Handle selecting an SVG file
  ----------------------------------------------------------------------------*/
  async function handleSelectSvgFile(fileKey) {
    setLoading(true);
    setSelectedSvgFile(fileKey);
    setSelectedSvgString(null);

    try {
      if (!showDeviceFiles) {
        // S3
        await downloadSvgFile(
          fileKey,
          setLoading,
          setSelectedSvgFile,
          setSelectedSvgString,
          selectedSvgString
        );
        return;
      }

      // DEVICE
      const text = await readDeviceFileText(fileKey);
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== "object") {
        alert("SVG file JSON is not an object");
        setSelectedSvgString({});
        return;
      }

      setSelectedSvgString(parsed);
    } catch (e) {
      console.error("Device SVG load failed:", e);
      setSelectedSvgString({});
    } finally {
      setLoading(false);
    }
  }

  /* Handle selecting a landmark file
  ----------------------------------------------------------------------------*/
  async function handleSelectLandmarkFile(fileKey) {
    setLoading(true);
    setSelectedLandmarkFile(fileKey);
    setFrames([]);
    setCurrentFrame(0);

    try {
      if (!showDeviceFiles) {
        // S3
        await downloadLandmarkFile(
          fileKey,
          setLoading,
          setSelectedLandmarkFile,
          setFrames,
          setCurrentFrame,
          setVideoDimensions,
          setHeight,
          setWidth,
          window
        );
        return;
      }

      // DEVICE
      const text = await readDeviceFileText(fileKey);
      let parsed;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          parsed = {};
        }

        let loadedLandmarks = [];
        let loadedDimensions = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

        if (Array.isArray(parsed)) {
        loadedLandmarks = parsed;
        } else if (parsed && typeof parsed === 'object') {
        loadedLandmarks = parsed.landmarks || [];
        if (parsed.videoDimensions) {
            loadedDimensions = parsed.videoDimensions;
        }
        }

        if (Array.isArray(loadedLandmarks[0])) {
        setFrames(loadedLandmarks);
        } else if (loadedLandmarks && typeof loadedLandmarks === 'object') {
        setFrames([loadedLandmarks]);
        } else {
        setFrames([]);
        }
        setVideoDimensions(loadedDimensions);
        setHeight(window.height * 0.7);
        setWidth(
          (loadedDimensions.width / loadedDimensions.height) * 
          (window.height * 0.7)
        );
    } catch (e) {
      console.error("Device landmark load failed:", e);
      setFrames([]);
      setVideoDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    } finally {
      setLoading(false);
    }
  }

  /*============================================================================
                            EFFECTS
  ============================================================================*/
  
  /* Animate through frames for pose replay
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (!frames.length) return;
    if (frames.length === 1) return;
    animationRef.current && clearInterval(animationRef.current);
    setCurrentFrame(0);
    animationRef.current = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frames.length);
    }, 60);
    return () => animationRef.current && clearInterval(animationRef.current);
  }, [frames]);

  /* Load files from S3 or device on mount or when showDeviceFiles changes
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (showDeviceFiles) {
      chooseDeviceFolderAndLoad();
    } else {
      fetchFiles(
        setLoading,
        setLandmarkFiles,
        setSvgFiles,
        setFiles,
        setSelectedLandmarkFile,
        setSelectedSvgFile,
        setFrames,
        setSelectedSvgString
      );
      return () => animationRef.current && clearInterval(animationRef.current);
    }
  }, [showDeviceFiles]);

  useEffect(() => {
    navigation.setParams({
      title: showDeviceFiles ? "Device Animations" : "S3 Animations",
      showDeviceFiles: showDeviceFiles,
      onSetShowDeviceFiles: () => setShowDeviceFiles(prev => !prev),
    });
  }, [showDeviceFiles]);


  /*============================================================================
                                RENDER 
  ============================================================================*/
  return (
    <ThemedView 
      style={{ 
        flex: 1,
        flexDirection: 'row', 
        alignItems: "flex-start", 
        padding: "2rem",  
        }}>

      <View style={{ flexDirection: 'column'}}>               
        <View 
          style={{
            flexDirection: 'row', 
            alignItems: 'flex-end',
            justifyContent: 'flex-start', 
            marginBottom: '1rem', 
            paddingBottom: '0.2rem',
            }}>
          <GiSkeleton 
            size={50} 
            color={theme.actionButton} 
            style={{ marginRight: "1rem" }} />
          <Text 
            style={{ 
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.text,
            }}>
            Pose Skeletons
          </Text>
        </View>
        {/* Landmark Files List */}
        <FlatList
          style={[
            styles.list, 
            {
              borderTop: `1px solid ${theme.border}`,
              borderRight: `1px solid ${theme.border}`,
              borderLeft: `1px solid ${theme.border}`, 
              marginBottom: '2rem',
            }]}
          data={landmarkFiles}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <DropdownSelect onPress={() => handleSelectLandmarkFile(item)} >
              <Text 
                style={[
                  styles.listItemText, 
                  { color: item === selectedLandmarkFile ? theme.actionButton : theme.text }]}>
                  {item}
              </Text>
            </DropdownSelect>
          )}
        />
        
        {selectedLandmarkFile &&
          <>
            <View 
              style={{
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'flex-start',
                marginBottom: '1rem', 
                paddingBottom: '0.2rem',
                }}>
              <BsPersonRaisedHand 
                size={50} 
                color={theme.actionButton} 
                style={{ marginRight: "1rem" }} />
              <Text 
                style={{ 
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: theme.text,
                  marginBottom: 0,
                }}>
                Sketches
              </Text>
            </View>
            {/* SVG Files List */}
            <FlatList
              style={[
                styles.list, 
                {
                  borderTop: `1px solid ${theme.border}`,
                  borderRight: `1px solid ${theme.border}`,
                  borderLeft: `1px solid ${theme.border}`,
                  marginBottom: 20,
                }]}
              data={svgFiles}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem, 
                    item === selectedSvgFile && styles.selectedListItem, 
                    {borderBottom: `1px solid ${theme.border}`}
                  ]}
                  onPress={() => handleSelectSvgFile(item)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = theme.border;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <Text 
                    style={[
                      styles.listItemText, 
                      { color: item === selectedSvgFile ? theme.actionButton : theme.text }]}>
                      {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        }
      </View>
      {/* Canvas Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {loading && <ActivityIndicator />}
        {selectedLandmarkFile && selectedSvgString && (
          <SvgCanvas
            width={width}
            height={height}
            webcamWidth={videoDimensions.width}
            webcamHeight={videoDimensions.height}
            landmarks={null}
            savedLandmarks={frames}
            replay={frames.length > 1}
            svgs={selectedSvgString}
            mapping={CANVAS_LANDMARK_MAP}
            armOrientation={"horizontal"}
            style={{
              border: '1px solid #555',
              background: '#111',
              zIndex: 2
            }}
        />
        )}
        {frames.length > 0 && selectedLandmarkFile && !selectedSvgFile && (
          <PoseCanvas
            width={width}
            height={height}
            landmarks={scaleLandmarks(
              frames[currentFrame],
              videoDimensions,
              { width, height }
            )}
            style={{ border: '1px solid #555', background: '#111' }}
          />
        )}
      </div>
    </ThemedView>
  );
};

export default ViewSavedPoses;

const styles = StyleSheet.create({
  list: {
    width: 320,
    maxHeight: '25vh',
    overflowY: 'auto',
    maxWidth: 320,
    flexShrink: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  listItem: {
    paddingVertical: "1rem",
    paddingHorizontal: "1.5rem",
    cursor: 'pointer',
  },
  listItemText: {
    fontSize: 18,
  },
  selectedListItem: {
    backgroundColor: '#e6f0ff',
  },
});