import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { 
  FaPaintBrush, 
  FaPalette,
  FaTrashAlt, 
  FaRunning, 
  FaFileExport,
  FaEraser, 
  FaChevronDown
} from 'react-icons/fa';
import { getIconSize } from '../../constants/Sizes';
import React from 'react';

import UploadS3 from '../buttons/UploadS3';
import { LuInfo } from "react-icons/lu";


const SketchButtons = ({ 
  eraseMode,
  strokeColor,
  onClear, 
  onToggleErase,
  onShowBrushSizeSlider,
  onShowColorPicker,
  onShowSketchInfo,
  onHoverTitle,
  onExportAll,
  onShowDetectPoseOptions,
  svgData,
  onHandleUpload,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const [hoveredExport, setHoveredExport] = React.useState(null);
    const [hoveredClear, setHoveredClear] = React.useState(null);
    const [hoveredErase, setHoveredErase] = React.useState(null);
    const [hoveredBrushSize, setHoveredBrushSize] = React.useState(null);
    const [hoveredColorPicker, setHoveredColorPicker] = React.useState(null);
    const [hoveredAnimate, setHoveredAnimate] = React.useState(null);
    const [hoveredInfo, setHoveredInfo] = React.useState(null);
    

  
    return (
    <View style={styles.container}>    

      {/* INFO BUTTON -------------------------------------------------------*/}
      <TouchableOpacity 
        onPress={() => {
          onShowSketchInfo && onShowSketchInfo();
        }}
        onMouseEnter={() => {
          onHoverTitle && onHoverTitle('Sketch Info')
          setHoveredInfo(true);
        }}
        onMouseLeave={() => {
          onHoverTitle && onHoverTitle('Sketch')
          setHoveredInfo(false);
        }}
      >
        <LuInfo
          size={getIconSize() * 1.5} 
          color={hoveredInfo ? theme.actionButtonHover : theme.actionButton} 
        />
      </TouchableOpacity>
      {/* EXPORT BUTTON -----------------------------------------------------*/}
      <UploadS3 
          landmarks={null}
          style={styles.button} 
          svgs={svgData}
          fileType="svg"  
          onMouseEnter={() => {
              onHoverTitle && onHoverTitle('Export All Sketches')
              setHoveredExport(true);
            } 
          }
          onMouseLeave={() => {
            onHoverTitle && onHoverTitle('Sketch')
            setHoveredExport(false);
          }}
          onHandleUpload={onHandleUpload}
      />

      {/* CLEAR BUTTON ------------------------------------------------------*/}
      <TouchableOpacity 
        onPress={onClear}
        onMouseEnter={() => {
          onHoverTitle && onHoverTitle('Clear Canvas')
          setHoveredClear(true);
        }}
        onMouseLeave={() => {
          onHoverTitle && onHoverTitle('Sketch')
          setHoveredClear(false);
        }}
      >
        <FaTrashAlt 
          size={getIconSize()} 
          color={hoveredClear ? theme.buttonHover : theme.button} 
        />
      </TouchableOpacity>

      {/* ERASE BUTTON ------------------------------------------------------*/}
      <TouchableOpacity 
        onPress={onToggleErase}
        onMouseEnter={() => {
          {eraseMode ? (
          onHoverTitle && onHoverTitle('Brush')
          ) : (
          onHoverTitle && onHoverTitle('Eraser')
          )}
          setHoveredErase(true);
        }}
        onMouseLeave={() => {
          onHoverTitle && onHoverTitle('Sketch')
          setHoveredErase(false);
        }}
      >
        {eraseMode ? (
          <FaPaintBrush 
            size={getIconSize()} 
            color={ hoveredErase ? theme.buttonHover : theme.button}  
          />
        ) : (
          <FaEraser 
            size={getIconSize()} 
            color={ hoveredErase ? theme.buttonHover : theme.button}  
          />
        )}
      </TouchableOpacity>

      
      {/* BRUSH SIZE BUTTON -------------------------------------------------*/}
      <View style={styles.buttonColumn}>
          {eraseMode ? (
            <FaEraser 
            size={getIconSize() / 2} 
            color={theme.button}  
            style={styles.brushButton}
            />
          ) : (
            <FaPaintBrush 
            size={getIconSize() / 2} 
            color={theme.button}  
            style={styles.brushButton}
            />
          )}
        <TouchableOpacity 
          onPress={onShowBrushSizeSlider}
          onMouseEnter={() => {
            (eraseMode ? (
            onHoverTitle && onHoverTitle('Select Eraser Size')
            ) : (
            onHoverTitle && onHoverTitle('Select Brush Size')
            ))
            setHoveredBrushSize(true);
          }}
          onMouseLeave={() => {
            onHoverTitle && onHoverTitle('Sketch')
            setHoveredBrushSize(false);
          }}
        >
          <FaChevronDown 
            size={getIconSize()} 
            color={hoveredBrushSize ? theme.buttonHover : theme.button}  
          />
        </TouchableOpacity>
      </View>
      
      {/* COLOR PICKER BUTTON -----------------------------------------------*/}
      <View style={styles.buttonColumn}>
        <FaPalette 
          size={getIconSize() / 2} 
          color={strokeColor}
          style={styles.brushButton} 
        />
        <TouchableOpacity 
          onPress={onShowColorPicker}
          onMouseEnter={() => {
            onHoverTitle && onHoverTitle('Select Color')
            setHoveredColorPicker(true);
          }}
          onMouseLeave={() => {
            onHoverTitle && onHoverTitle('Sketch')
            setHoveredColorPicker(false);
          }}
        >
          <FaChevronDown 
            size={getIconSize()} 
            color={hoveredColorPicker ? theme.buttonHover : theme.button}  
          />
        </TouchableOpacity>
      </View>

      
      {/* ANIMATE BUTTON ----------------------------------------------------*/}
      <TouchableOpacity
        onPress={() => {
          onShowDetectPoseOptions && onShowDetectPoseOptions();
        }}
        onMouseEnter={() => {
          onHoverTitle && onHoverTitle('Animate Sketch')
          setHoveredAnimate(true);
        }}
        onMouseLeave={() => {
          onHoverTitle && onHoverTitle('Sketch')
          setHoveredAnimate(false);
        }}
      >
        <FaRunning 
          size={getIconSize() * 1.5} 
          color={hoveredAnimate ? theme.actionButtonHover : theme.actionButton} 
        />
      </TouchableOpacity>


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    gap: 24,
  },

  buttonColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },

  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  brushButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  
});

export default SketchButtons;
