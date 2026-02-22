import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

const OptionButton = ({ children, onPress }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [hovered, setHovered] = React.useState(false);
    return (
        <TouchableOpacity 
            style={[
                styles.optionButton, 
                { backgroundColor: hovered ? theme.listItemBackgroundHover : theme.listItemBackground }
            ]}
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
        flex: 1, 
        width: '100%', 
        paddingVertical: "1rem",
        paddingHorizontal: "1rem",
    },

    text: {
        fontSize: 20,
        fontWeight: '500',
    },
})  


