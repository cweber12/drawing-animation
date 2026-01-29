
import { ActivityIndicator, TouchableOpacity, Text, StyleSheet, FlatList } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import ThemedView from '../components/themed_components/ThemedView';
import PoseCanvas from '../components/canvas/PoseCanvas';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants/Sizes';

const API_BASE = 'https://kqaq8gwqvl.execute-api.us-east-2.amazonaws.com/prod';
const BUCKET = 'pose-animations';

const ViewSavedPoses = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [frames, setFrames] = useState([]); // Array of landmark frames
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef(null);

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
      } catch (e) {
        parsed = [];
      }
      // If the file is a single frame, wrap in array
      if (Array.isArray(parsed)) {
        setFrames(parsed);
      } else if (parsed && typeof parsed === 'object') {
        setFrames([parsed]);
      } else {
        setFrames([]);
      }
    } catch (err) {
      setFrames([]);
    } finally {
      setLoading(false);
    }
  };

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
    <ThemedView style={{ flex: 1, flexDirection: 'row', padding: 16 }}>
      <FlatList
        style={styles.list}
        data={files}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.listItem, item === selectedFile && styles.selectedListItem]}
            onPress={() => downloadFile(item)}
          >
            <Text style={styles.listItemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {loading && <ActivityIndicator />}
        {frames.length > 0 && (
          <PoseCanvas
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            landmarks={frames[currentFrame]}
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
    marginVertical: 8,
    width: 200,
    maxHeight: '80vh',
    maxWidth: 300,
    padding: 8,
    flexShrink: 0,
  },
  listItem: {
    paddingVertical: "8px",
    paddingHorizontal: "12px",
    marginVertical: "4px",
    borderRadius: 4,
    backgroundColor: '#222',
    border: '1px solid #444',
    cursor: 'pointer',
  },
  selectedListItem: {
    backgroundColor: '#444',
  },
  listItemText: {
    fontSize: 16,
    color: 'white',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#222',
  },
});