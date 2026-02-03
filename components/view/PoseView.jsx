import { View, useColorScheme } from 'react-native'
import { Colors } from '../../constants/Colors'
import { CANVAS_HEIGHT } from '../../constants/Sizes';
import ThemedView from './ThemedView';

const PoseView = ({ children }) => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <ThemedView 
        style={[
          {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: "100vw",
            height: CANVAS_HEIGHT,
            flex: 1,
            paddingTop: 20,
            overflow: 'hidden',
          }, 
        ]}
    >
      {children}
    </ThemedView>
  )
}

export default PoseView