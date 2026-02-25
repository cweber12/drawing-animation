import { 
    StyleSheet,  
    TouchableOpacity, 
    useColorScheme 
} from 'react-native'
import React, { useEffect } from 'react'
import { Colors } from '../../constants/Colors';
import { getIconSize } from '../../constants/Sizes';

const OptionButton = ({ 
    children, 
    onPress, 
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    const [hovered, setHovered] = React.useState(false);

    return (
        <TouchableOpacity 
            style={[
                styles.optionButton, 
                { backgroundColor: hovered ? theme.listItemBackgroundHover : 
                                             theme.listItemBackground }]}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onPress={onPress}
        >
            {children}
        </TouchableOpacity>
    )
}

export default OptionButton

const styles = StyleSheet.create({
    optionButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%', 
        paddingVertical: 12,
        paddingHorizontal: 24,
        gap: 12,
    },

    text: {
        fontSize: 18,
    },
})  


