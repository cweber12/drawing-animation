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
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0,

          }, 
          style
        ]}
        {...props}
    />


  )
}

export default ThemedView