import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  useColorScheme,
  Touchable,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { 
  FaPaintBrush, 
  FaPalette,
  FaTrashAlt, 
  FaRunning, 
  FaVideo,
  FaFileVideo, 
  FaFileExport,
  FaEraser
} from 'react-icons/fa';
import { RiWebcamFill } from "react-icons/ri";
import { getIconSize } from '../../constants/Sizes';

const DrawWebHeaderButtons = ({ 
  viewMode,
  onSave,
  onClear, 
  onToggleEraseMode,
  onShowBrushSizeSlider,
  onShowColorPicker,
  setPoseView,
  setSvgView,
  onPickVideo,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
    <View style={styles.container}>    
      
      <TouchableOpacity 
        onPress={() => {
          onSave && onSave();
        }}
      >
        <FaFileExport size={getIconSize()} color={theme.button} />
      </TouchableOpacity>
      
      <TouchableOpacity  
        onPress={() => {
          onPickVideo && onPickVideo();
        }}>
        <FaFileVideo size={getIconSize()} color={theme.button} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => {
          setPoseView && setPoseView();
          //onOpenCamera && onOpenCamera();
        }}
      >
        <FaRunning size={getIconSize()} color={theme.button} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => {
          setSvgView && setSvgView();
          //onOpenCamera && onOpenCamera();
        }}
      >
        <RiWebcamFill size={getIconSize()} color={theme.button} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onClear}
      >
        <FaTrashAlt size={getIconSize()} color={theme.button} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onToggleEraseMode}
      >
        <FaEraser size={getIconSize()} color={theme.button}  />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onShowBrushSizeSlider}
      >
        <FaPaintBrush size={getIconSize()} color={theme.button}  />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={onShowColorPicker}
      >
        <FaPalette size={getIconSize()} color={theme.button}  />
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

  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});

export default DrawWebHeaderButtons;
