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
  FaVideo
} from 'react-icons/fa';
import { getIconSize } from '../../constants/Sizes';

const DrawWebHeaderButtons = ({ 
  onClear, 
  onShowBrushSizeSlider,
  onShowColorPicker,
  setPoseView,
  setSvgView,
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  
    return (
    <View style={styles.container}>    
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
        <FaVideo size={getIconSize()} color={theme.button} />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onClear}
      >
        <FaTrashAlt size={getIconSize()} color={theme.button} />
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
