
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
import ThemedView from '../components/themed_components/ThemedView';
import PoseCanvas from '../components/canvas/PoseCanvas';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { CANVAS_LANDMARK_MAP } from '../constants/landmarkData';
import SvgCanvas from '../components/canvas/SvgCanvas';
import { fetchFiles, downloadLandmarkFile, downloadSvgFile } from '../utils/s3Utils';
import { Select } from '@tensorflow/tfjs';
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
  const animationRef = useRef(null);
  const window = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  // Scale landmarks to canvas
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
  }, []);

  const downloadSvgs = async (fileKey) => {
    await downloadSvgFile(
      fileKey,
      setLoading,
      setSelectedSvgFile,
      setSelectedSvgString, 
      selectedSvgString, 
    );
  }

  const downloadLandmarks = async (fileKey) => {
    await downloadLandmarkFile(
      fileKey,
      setLoading,
      setSelectedLandmarkFile,
      setFrames,
      setCurrentFrame,
      setVideoDimensions,
      setHeight,
      setWidth,
      window,
    );
  }

  useEffect(() => {
    console.log("selectedSvgFile changed:", selectedSvgFile);
  }, [selectedSvgFile]);

  useEffect(() => {
    console.log("selectedSvgString changed:", selectedSvgString);
  }, [selectedSvgString]);

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
          justifyContent: 'space-between', 
          marginBottom: 16, 
          borderBottom: `2px solid ${theme.actionButton}`,
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
            marginBottom: 20,
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
            onPress={() => downloadLandmarks(item)}
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
            marginBottom: 16, 
            borderBottom: `2px solid ${theme.actionButton}`,
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
                onPress={() => downloadSvgs(item)}
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