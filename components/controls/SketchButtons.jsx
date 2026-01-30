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

import { uploadToS3 } from '../../utils/s3Utils';
import { LuInfo } from "react-icons/lu";
import { GiRaiseZombie } from "react-icons/gi";
import HeaderButton from '../buttons/HeaderButton';


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
  onHandleUploadSvg,
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
      <HeaderButton
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
          size={getIconSize()} 
          color={hoveredInfo ? theme.button : theme.text} 
        />
      </HeaderButton>
      {/* EXPORT BUTTON -----------------------------------------------------*/}
      <TouchableOpacity
        onPress={() => {
          if (typeof onHandleUploadSvg === 'function') {
            onHandleUploadSvg();
          }
        }}
        onMouseEnter={() => {
          onHoverTitle && onHoverTitle('Export All Sketches')
          setHoveredExport(true);
        }}
        onMouseLeave={() => {
          onHoverTitle && onHoverTitle('Sketch')
          setHoveredExport(false);
        }}
        disabled={false}
      >
        <FaFileExport
          size={getIconSize()}
          color={hoveredExport ? theme.button : theme.text}
        />
      </TouchableOpacity>

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
          color={hoveredClear ? theme.button : theme.text} 
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
            color={hoveredErase ? theme.button : theme.text}  
          />
        ) : (
          <FaEraser 
            size={getIconSize()} 
            color={hoveredErase ? theme.button : theme.text}  
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
            color={theme.text}  
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
            color={hoveredBrushSize ? theme.button : theme.text}  
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
            color={hoveredColorPicker ? theme.button : theme.text}  
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
        <GiRaiseZombie 
          size={getIconSize() * 2} 
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
    alignItems: 'flex-end',
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
