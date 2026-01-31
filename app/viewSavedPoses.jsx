
import { 
  ActivityIndicator, 
  TouchableOpacity, 
  Text, 
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
import { CANVAS_LANDMARK_MAP } from '../constants/LandmarkData';
import SvgCanvas from '../components/canvas/SvgCanvas';

const API_BASE = 'https://kqaq8gwqvl.execute-api.us-east-2.amazonaws.com/prod';
const BUCKET = 'pose-animations';

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

  // Helper to encode S3 keys
  const encodeS3KeyForPath = (key) =>
    key.split("/").map(encodeURIComponent).join("/");

  // Fetch file lists
  const fetchFiles = async () => {
    setLoading(true);
    setSelectedLandmarkFile(null);
    setSelectedSvgFile(null);
    setFrames([]);
    setSelectedSvgString(null);
    try {
      const url = `${API_BASE}/${BUCKET}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const xml = await response.text();
      const keys = [...xml.matchAll(/<Key>(.*?)<\/Key>/g)].map(m => m[1]);
      const landmarkFiles = keys.filter(k => k.startsWith('landmarks/') && k.endsWith('.json'));
      const svgFiles = keys.filter(k => k.startsWith('svgs/') && k.endsWith('.svg'));
      setLandmarkFiles(landmarkFiles);
      setSvgFiles(svgFiles);
      setFiles(keys);
    } catch (err) {
      setLandmarkFiles([]);
      setSvgFiles([]);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Download and parse landmark file
  const downloadLandmarkFile = async (fileKey) => {
    setLoading(true);
    setSelectedLandmarkFile(fileKey);
    setFrames([]);
    setCurrentFrame(0);
    try {
      const downloadUrl = `${API_BASE}/${BUCKET}/${encodeS3KeyForPath(fileKey)}`;
      const response = await fetch(downloadUrl, { method: "GET" });
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const content = await response.text();
      let parsed;
      try {
        parsed = JSON.parse(content);
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
    } catch (err) {
      setFrames([]);
      setVideoDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    } finally {
      setLoading(false);
    }
  };

  // Download SVG file as string
  const downloadSvgFile = async (fileKey) => {
    setLoading(true);
    setSelectedSvgFile(fileKey);
    setSelectedSvgString(null);
    try {
      const downloadUrl = `${API_BASE}/${BUCKET}/${encodeS3KeyForPath(fileKey)}`;
      const response = await fetch(downloadUrl, { method: "GET" });
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const text = await response.text();
      let svgString = text;
      console.log('Raw downloaded SVG text:', text);
    let svgObj = {};
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        svgObj = parsed; // Use all SVG parts
        console.log('Parsed SVG object:', svgObj);
      } else {
        svgObj = { custom: svgString };
      }
    } catch (e) {
      // Not JSON, treat as raw SVG
      svgObj = { custom: svgString };
    }
    setSelectedSvgString(svgObj);
      console.log('Downloaded SVG string:', svgString);
      console.log('Mapping passed:', CANVAS_LANDMARK_MAP);
    } catch (err) {
      setSelectedSvgString(null);
    } finally {
      setLoading(false);
    }
  };

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
    fetchFiles();
    return () => animationRef.current && clearInterval(animationRef.current);
  }, []);

  return (
    <ThemedView style={{ flex: 1, flexDirection: 'row', alignItems: "flex-start", padding: "2rem" }}>
      {/* Landmark List */}
      <FlatList
        style={[
          styles.list, 
          {
            backgroundColor: theme.navBackground, 
            borderTop: `1px solid ${theme.border}`,
            borderRight: `1px solid ${theme.border}`,
            borderLeft: `1px solid ${theme.border}`
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
            onPress={() => downloadLandmarkFile(item)}
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
      {/* SVG List */}
      {selectedLandmarkFile &&
      <FlatList
        style={[
          styles.list, 
          {
            backgroundColor: theme.navBackground, 
            borderTop: `1px solid ${theme.border}`,
            borderRight: `1px solid ${theme.border}`,
            borderLeft: `1px solid ${theme.border}`,
            marginLeft: 16,
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
            onPress={() => downloadSvgFile(item)}
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
      }
      {/* Canvas Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {loading && <ActivityIndicator />}
        {selectedLandmarkFile && selectedSvgString && !loading && (
          <SvgCanvas
            width={width}
            height={height}
            webcamWidth={videoDimensions.width}
            webcamHeight={videoDimensions.height}
            landmarks={scaleLandmarks(
              frames[currentFrame],
              videoDimensions,
              { width, height }
            )}
            savedLandmarks={frames}
            replay={frames.length > 1}
            svgs={selectedSvgString}            
            mapping={CANVAS_LANDMARK_MAP}
            armOrientation={"horizontal"}
            style={{ border: '1px solid #555', background: '#111' }}
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