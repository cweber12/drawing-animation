import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ActivityIndicator, 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants/Sizes';
import { Colors } from '../../constants/Colors';

import {
  fetchFiles,
  downloadLandmarkFile,
  downloadSvgFile,
} from '../../utils/storage/s3Utils';
import {
  selectPoseFolder,
  listDevicePoseFiles,
  readDeviceFileText,
} from '../../utils/storage/deviceFetch';
import { useLandmarks } from '../../context/LandmarksContext';
import List from './List';

export default function FileList({
  // selected items
  selectedLandmarkFile,
  setSelectedLandmarkFile,
  selectedSvgFile,
  setSelectedSvgFile,
  setSelectedSvgString,

  // source mode / loading
  showDeviceFiles,
  setShowDeviceFiles,

  // cleanup
  animationRef,
  // optional: mirror loaded frames/video dims into parent state
  frames,
  setFrames,
  videoDimensions,
  setVideoDimensions,
  setWidth,
  setHeight,
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const debugLandmarkFetch = false; 
  const debugSvgFetch = false;
  
  const { setDimensions } = useLandmarks();

  const [loading, setLoading] = React.useState(false);
  const [svgFiles, setSvgFiles] = useState([]);
  const [landmarkFiles, setLandmarkFiles] = useState([]);

  

  /* LOAD FILES FROM DEVICE
  ----------------------------------------------------------------------------*/
  const chooseDeviceFolderAndLoad = async () => {
    setLoading(true);
    try {
      const ok = await selectPoseFolder();
      if (!ok) return;

      setShowDeviceFiles(true);

      // reset selections/state
      setSelectedSvgFile(null);
      setSelectedSvgString(null);
      setSvgFiles([]);

      // load from selected folder
      const result = await listDevicePoseFiles();
      setLandmarkFiles(result?.landmarkFiles ?? []);
      setSvgFiles(result?.svgFiles ?? []);
    } catch (e) {
      console.error(e);
      setSvgFiles([]);
    } finally {
      setLoading(false);
    }
  };

  /* HANDLE SVG FILE SELECTION
  ----------------------------------------------------------------------------*/
  async function handleSelectSvgFile(fileKey) {
    setLoading(true);
    setSelectedSvgFile(fileKey);
    setSelectedSvgString(null);
    if (fileKey === selectedSvgFile) {
      setSelectedSvgFile(null);
      setLoading(false);
      return;
    }

    try {
      // S3
      if (!showDeviceFiles) {
        if (debugSvgFetch) {
          console.log('Loading SVG file from S3 with key:', fileKey);
        }
        const svgObj = await downloadSvgFile(fileKey);
        setSelectedSvgString(svgObj);
        if (debugSvgFetch) {
          console.log('SVG file loaded successfully from S3');
        }
        return;
      }

      // DEVICE
      const text = await readDeviceFileText(fileKey);
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== 'object') {
        alert('SVG file JSON is not an object');
        setSelectedSvgString({});
        return;
      }

      setSelectedSvgString(parsed);
    } catch (e) {
      console.error('Device SVG load failed:', e);
      setSelectedSvgString({});
    } finally {
      setLoading(false);
    }
  }

  /* HANDLE LANDMARK FILE SELECTION
  ----------------------------------------------------------------------------*/
  async function handleSelectLandmarkFile(fileKey) {
    setLoading(true);
    setSelectedLandmarkFile(fileKey);

    try {
      if (!showDeviceFiles) {
        // S3
        setLoading(true);
        console.log('Loading landmark file from S3:', fileKey);
        try {
          const { landmarks, videoDimensions } = await downloadLandmarkFile(fileKey);
          // mirror into parent/page state; context scaling will be applied by the page
          if (typeof setFrames === 'function') setFrames(landmarks);
          if (typeof setVideoDimensions === 'function') setVideoDimensions(videoDimensions);
          if (typeof setWidth === 'function' && videoDimensions?.width) setWidth(videoDimensions.width);
          if (typeof setHeight === 'function' && videoDimensions?.height) setHeight(videoDimensions.height);
          // store video dimensions in context for consumers that use it
          setDimensions(videoDimensions);
          if (debugLandmarkFetch) {
            console.log('Landmark file loaded successfully from S3');
          }
        } catch (e) {
          console.error('S3 landmark load failed:', e);
          // clear page state
          if (typeof setFrames === 'function') setFrames([]);
          if (typeof setVideoDimensions === 'function') setVideoDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
          setDimensions({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
          
        } finally {
          setLoading(false);
        }
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
        if (typeof setFrames === 'function') setFrames(loadedLandmarks);
      } else if (parsed && typeof parsed === 'object') {
        loadedLandmarks = parsed.landmarks || [];
        if (typeof setFrames === 'function') setFrames(loadedLandmarks);
        if (parsed.videoDimensions) {
          loadedDimensions = parsed.videoDimensions;
          setDimensions(loadedDimensions);
          if (typeof setVideoDimensions === 'function') setVideoDimensions(loadedDimensions);
          if (typeof setWidth === 'function' && loadedDimensions.width) setWidth(loadedDimensions.width);
          if (typeof setHeight === 'function' && loadedDimensions.height) setHeight(loadedDimensions.height);
        }
      }

    } catch (e) {
      console.error('Device landmark load failed:', e);
    } finally {
      setLoading(false);
    }
  }

  /* LOAD FILES WHEN SOURCE MODE CHANGES
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (showDeviceFiles) {
      chooseDeviceFolderAndLoad();
      return;
    }

    fetchFiles(
      setLoading,
      setLandmarkFiles,
      setSvgFiles,
      () => {}, // placeholder for setFiles (not used here)
      setSelectedLandmarkFile,
      setSelectedSvgFile,
    );

    return () => {
      if (animationRef?.current) clearInterval(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeviceFiles]);

  const initialLandmarkSelectionDone = React.useRef(false);
  const initialSvgSelectionDone = React.useRef(false);

  /* AUTO-SELECT FIRST ITEMS WHEN FILES LOAD
  ----------------------------------------------------------------------------*/
  useEffect(() => {
    if (initialLandmarkSelectionDone.current && initialSvgSelectionDone.current) return;

    const firstLandmark = landmarkFiles.length > 0 ? landmarkFiles[0] : null;
    const firstSvg = svgFiles.length > 0 ? svgFiles[0] : null;

    if (!firstLandmark && !firstSvg) return;

    if (firstLandmark && !selectedLandmarkFile) {
      handleSelectLandmarkFile(firstLandmark); // loads landmark + sets state
      initialLandmarkSelectionDone.current = true;
    }

    if (firstSvg && !selectedSvgFile) {
      handleSelectSvgFile(firstSvg); // loads svg + sets state
      initialSvgSelectionDone.current = true;
    }
  }, [
    landmarkFiles,
    svgFiles,
    selectedLandmarkFile,
    selectedSvgFile,
    handleSelectLandmarkFile,
    handleSelectSvgFile,
  ]);

  return (
    <View style={styles.listWrapper}>
      <View style={styles.listHeader}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          LANDMARK FILES
        </Text>
      </View>
      {loading && <ActivityIndicator />}
      {/* Landmark Files List */}
      <List
        items={landmarkFiles}
        selectedItem={selectedLandmarkFile}
        onSelect={handleSelectLandmarkFile}
        keyExtractor={(item) => item}
        selectedItemStyle={{ backgroundColor: theme.actionButton }}
        renderItemContent={(item) => (
          <Text style={[styles.listItemText, { color: item === selectedLandmarkFile ? theme.actionButtonText : theme.text }]}>
            {item}
          </Text>
        )}
      />

      {selectedLandmarkFile && (
        <>
          <View style={styles.listHeader}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              SVG IMAGE FILES
            </Text>
          </View>

          {/* SVG Files List */}
          <List
            items={svgFiles}
            selectedItem={selectedSvgFile}
            onSelect={handleSelectSvgFile}
            keyExtractor={(item) => item}
            selectedItemStyle={{ backgroundColor: theme.actionButton }}
            renderItemContent={(item) => (
              <Text style={[styles.listItemText, { color: item === selectedSvgFile ? theme.actionButtonText : theme.text }]}>
                {item}
              </Text>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    listWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            padding: 12,
    },

    listHeader: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        width: '100%',
        padding: 12,
    },

    headerTitle: {
        fontSize: 18, 
        fontWeight: 'bold',
    },

    list: {
        width: 320,
        maxHeight: '25vh',
        overflowY: 'auto',
        maxWidth: 320,
        flexShrink: 0,
        direction: 'rtl',
        scrollbarGutter: 'stable',

    },

    listItem: {
        paddingVertical: '1rem',
        paddingHorizontal: '1.5rem',
        cursor: 'pointer',
        
    },

    listItemText: {
    fontSize: 18,
    },

});