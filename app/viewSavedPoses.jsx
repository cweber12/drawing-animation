import { 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Button, 
  Text,
  StyleSheet
} from 'react-native';
import React, { useState, useEffect } from 'react';
import ThemedView from '../components/themed_elements/ThemedView';
import PoseCanvas from '../components/canvas/PoseCanvas';

const API_BASE = 'https://kqaq8gwqvl.execute-api.us-east-2.amazonaws.com/prod';
const BUCKET = 'pose-animations';

const ViewSavedPoses = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    setSelectedContent(null);
    try {
      const url = `${API_BASE}/${BUCKET}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const xml = await response.text()
      const keys = [...xml.matchAll(/<Key>(.*?)<\/Key>/g)].map(m => m[1]);
      setFiles(keys);
    } catch (err) {
      setFiles([]);
      setSelectedContent(String(err));
    } finally {
      setLoading(false);
    }
  };

  // preserve slashes; only encode each segment
  const encodeS3KeyForPath = (key) =>
    key.split("/").map(encodeURIComponent).join("/");

  const downloadFile = async (fileKey) => {
    setLoading(true);
    try {
      const downloadUrl = `${API_BASE}/${BUCKET}/${encodeS3KeyForPath(fileKey)}`;
      console.log('Downloading from', downloadUrl);
      const response = await fetch(downloadUrl, { method: "GET" });
      if (!response.ok) throw new Error(`Failed: ${response.status}`);
      const content = await response.text();
      setSelectedContent(content);
    } catch (err) {
      setSelectedContent(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>

      {loading && <ActivityIndicator />}
      <FlatList
        style={styles.list}
        data={files}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => downloadFile(item)} 
          >
            <Text style={styles.listItemText}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      {selectedContent && (
        <PoseCanvas poseData={selectedContent} />
      )}
    </ThemedView>
  );
};

export default ViewSavedPoses;

const styles = StyleSheet.create({
  list: {
    marginVertical: 8,
    width: 'fit-content',
    height: 'auto',
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 8,
  },

  listItem: {
    padding: 12,
  },

  listItemText: {
    fontSize: 16,
    color: 'white',
    border: '1px solid #555',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#222',
  },
});