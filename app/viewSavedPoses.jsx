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
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { CANVAS_LANDMARK_MAP } from '../constants/landmarkData';
import SvgCanvas from '../components/canvas/SvgCanvas';
import ThemedView from '../components/themed_components/ThemedView';
import PoseCanvas from '../components/canvas/PoseCanvas';
import { fetchFiles, downloadLandmarkFile, downloadSvgFile } from '../utils/s3Utils';
import {
  selectPoseFolder,
  listDevicePoseFiles,
  readDeviceFileText,
} from "../utils/storageUtils";
import { GiRaiseZombie } from "react-icons/gi";
import { FaPencilAlt } from "react-icons/fa";


const ViewSavedPoses = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [frames, setFrames] = useState([]);
  const [videoDimensions, setVideoDimensions] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const [width, setWidth] = useState(CANVAS_WIDTH);
  const [height, setHeight] = useState(CANVAS_HEIGHT);
  const [selectedLandmarkFile, setSelectedLandmarkFile] = useState(null);
  const [selectedSvgFile, setSelectedSvgFile] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [landmarkFiles, setLandmarkFiles] = useState([]);
  const [svgFiles, setSvgFiles] = useState([]);
  const [selectedSvgString, setSelectedSvgString] = useState(null);
  const [showDeviceFiles, setShowDeviceFiles] = useState(false);
  const animationRef = useRef(null);
  const window = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  /* Scale landmarks to fit target dimensions
  ------------------------------------------------------------------------------
  Scales the given landmarks from original dimensions to target dimensions.
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
  ------------------------------------------------------------------------------
  Allows user to select a folder from device storage and loads landmark and SVG 
  files from that folder.
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

  // Animation effect
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
        setWidth((loadedDimensions.width / loadedDimensions.height) * (window.height * 0.7));
    } catch (e) {
      console.error("Device landmark load failed:", e);
      setFrames([]);
      setVideoDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    } finally {
      setLoading(false);
    }
  }

  /* Rendering
  ----------------------------------------------------------------------------*/
  return (
    <ThemedView 
      style={{ 
        flex: 1,
        flexDirection: 'row', 
        alignItems: "flex-start", 
        padding: "2rem",  
        }}>

      <View style={{ flexDirection: 'column'}}>        
          <TouchableOpacity
            style={[styles.listItem, { marginBottom: 16, backgroundColor: theme.actionButton }]}
            onPress={chooseDeviceFolderAndLoad}
          >
            <Text style={[styles.listItemText, { color: "#fff", fontWeight: "bold" }]}>
              Choose Folder
            </Text>
          </TouchableOpacity>
        
        <View 
          style={{
            flexDirection: 'row', 
            alignItems: 'flex-end',
            justifyContent: 'flex-start', 
            marginBottom: '1rem', 
            paddingBottom: '0.2rem',
            }}>
          <GiRaiseZombie 
            size={42} 
            color={theme.actionButton} 
            style={{ marginRight: "1rem" }} />
          <Text 
            style={{ 
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.text,
            }}>
            Animations
          </Text>
        </View>
        {/* Landmark Files List */}
        <FlatList
          style={[
            styles.list, 
            {
              backgroundColor: theme.navBackground, 
              borderTop: `1px solid ${theme.border}`,
              borderRight: `1px solid ${theme.border}`,
              borderLeft: `1px solid ${theme.border}`, 
              marginBottom: '2rem',
            }]}
          data={landmarkFiles}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.listItem, 
                item === selectedLandmarkFile && styles.selectedListItem, 
                {borderBottom: `1px solid ${theme.border}`}
              ]}
              onPress={() => handleSelectLandmarkFile(item)}
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
                  { color: item === selectedLandmarkFile ? theme.actionButton : theme.text }]}>
                  {item}
              </Text>
            </TouchableOpacity>
          )}
        />
        
        {selectedLandmarkFile &&
          <>
            <View 
              style={{
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '1rem', 
                borderBottom: `2px solid ${theme.actionButton}`,
                paddingBottom: '0.2rem',
                }}>
              <FaPencilAlt 
                size={32} 
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
                  backgroundColor: theme.navBackground, 
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
    maxHeight: '80vh',
    maxWidth: 320,
    flexShrink: 0,
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