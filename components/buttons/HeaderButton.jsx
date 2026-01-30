import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { getIconSize } from '../../constants/Sizes';

const HeaderButton = ({children, style, onPress, onHoverTitle, title, size}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [hovered, setHovered] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);
    const iconColor = hovered ? theme.actionButton : theme.text;
    const [iconSize, setIconSize] = React.useState(size ?? getIconSize());

    useEffect(() => {
        setIconSize(pressed ? (
            (size ?? getIconSize()) * 0.9 ) : (
            (size ?? getIconSize())
        ));
    }, [pressed]);

    return (
        <TouchableOpacity 
            onPress={onPress}
            style={[styles.button, style]}
            activeOpacity={1}
            onMouseEnter={() => {
            setHovered(true);
            onHoverTitle && onHoverTitle(title);
            }}
            onMouseLeave={() => {
            setHovered(false);
            onHoverTitle && onHoverTitle('Sketch');
            }}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
        >
            {React.cloneElement(
                children, 
                {
                    color: iconColor, 
                    size: iconSize
                }
                )}
        </TouchableOpacity>
    )
    }

export default HeaderButton

const styles = StyleSheet.create({
    button: {
        marginHorizontal: "0.5rem",
        padding: 0,
    },
})