import { View, useColorScheme, Dimensions} from 'react-native'
import { Colors } from '../../constants/Colors'

const ThemedView = ({ style, ...props }) => {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  const  { width, height } = Dimensions.get('window');
  return (
    
    
    <View 
        style={[
          {
            backgroundColor: theme.background,
            width: width,
            height: height,
            maxWidth: width,
            maxHeight: height, 
          }, 
          style
        ]}
        {...props}
    />


  )
}

export default ThemedView