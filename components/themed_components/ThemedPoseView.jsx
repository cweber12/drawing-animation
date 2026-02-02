import { View, useColorScheme } from 'react-native'
import { Colors } from '../../constants/Colors'
import { CANVAS_WIDTH, CANVAS_HEIGHT, getWebcamDimensions } from '../../constants/Sizes';

const ThemedPoseView = ({ children }) => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <View 
        style={[
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.background, 
            width: "100vw",
            height: CANVAS_HEIGHT,
            flex: 1,
            paddingTop: 20,
            overflow: 'hidden',
          }, 
        ]}
    >
      {children}
    </View>
  )
}

export default ThemedPoseView