// components/buttons/HeaderButton.jsx
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { getIconSize } from '../../constants/Sizes';

/* A reusable button component for header buttons with hover and press effects
------------------------------------------------------------------------------*/
const HeaderButton = ({
    children, 
    style, 
    onPress, 
    setHoveredProp,
    size, 
    disabled, 
    selected, 
    color, 
    hoveredColor, 
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [hovered, setHovered] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);
    const [iconSize, setIconSize] = React.useState(size ?? getIconSize());


    const iconColor =  color ? 
        (hovered ? (hoveredColor ?? theme.iconHover) : color)
        : (hovered ? theme.iconHover : theme.icon);
    

    useEffect(() => {
        setIconSize(pressed ? (
            (size ?? getIconSize()) * 0.9 ) : (
            (size ?? getIconSize())
        ));
    }, [pressed]);

    return (
        <TouchableOpacity 
            onPress={onPress}
            style={[
                styles.button, 
                style, 
            ]}
            disabled={disabled}
            selected={selected}
            activeOpacity={1}
            onMouseEnter={() => {
                setHovered(true);
                setHoveredProp && setHoveredProp(true);
            }}
            onMouseLeave={() => {
            setHovered(false);
            setHoveredProp && setHoveredProp(false);
            }}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
        >
            {React.cloneElement(
                children, 
                {
                    color: disabled || selected ? theme.actionButton : iconColor, 
                    size: iconSize,
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
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.1s cubic-bezier(.4,0,.2,1)',
    },
})