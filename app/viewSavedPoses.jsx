
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

const API_BASE = 'https://kqaq8gwqvl.execute-api.us-east-2.amazonaws.com/prod';
const BUCKET = 'pose-animations';

const ViewSavedPoses = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [frames, setFrames] = useState([]); // Array of landmark frames
  const [videoDimensions, setVideoDimensions] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  const [width, setWidth] = useState(CANVAS_WIDTH);
  const [height, setHeight] = useState(CANVAS_HEIGHT);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef(null);
  const window = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const fetchFiles = async () => {
    setLoading(true);
    setSelectedFile(null);
    setFrames([]);
    try {
      const url = `${API_BASE}/${BUCKET}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const xml = await response.text();
      const keys = [...xml.matchAll(/<Key>(.*?)<\/Key>/g)].map(m => m[1]);
      setFiles(keys);
    } catch (err) {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // preserve slashes; only encode each segment
  const encodeS3KeyForPath = (key) =>
    key.split("/").map(encodeURIComponent).join("/");

  const downloadFile = async (fileKey) => {
    setLoading(true);
    setSelectedFile(fileKey);
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
        console.log('viewSavedPoses : Parsed landmarks:', parsed);
      } catch (e) {
        parsed = {};
      }

      // Extract landmarks and videoDimensions
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

      // If the file is a single frame, wrap in array
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
    if (frames.length === 1) return; // single frame, no animation
    animationRef.current && clearInterval(animationRef.current);
    setCurrentFrame(0);
    animationRef.current = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frames.length);
    }, 60); // ~16 FPS
    return () => animationRef.current && clearInterval(animationRef.current);
  }, [frames]);

  useEffect(() => {
    fetchFiles();
    return () => animationRef.current && clearInterval(animationRef.current);
  }, []);

  return (
    <ThemedView style={{ flex: 1, flexDirection: 'row', alignItems: "flex-start", padding: "2rem" }}>
      <FlatList
        style={[
          styles.list, 
          {
            backgroundColor: theme.navBackground, 
            borderTop: `1px solid ${theme.border}`,
            borderRight: `1px solid ${theme.border}`,
            borderLeft: `1px solid ${theme.border}`
          }]}
        data={files}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.listItem, 
              item === selectedFile && styles.selectedListItem, 
              {borderBottom: `1px solid ${theme.border}`}
            ]}
            onPress={() => downloadFile(item)}
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
                { color: item === selectedFile ? theme.actionButton : theme.text }]}>
                {item}
            </Text>
          </TouchableOpacity>
        )}
      />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading && <ActivityIndicator />}
        {frames.length > 0 && (
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
});