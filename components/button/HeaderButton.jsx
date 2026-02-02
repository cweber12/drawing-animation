// components/buttons/HeaderButton.jsx
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { getIconSize } from '../../constants/Sizes';

/* A reusable button component for header buttons with hover and press effects
--------------------------------------------------------------------------------
Props:
- children: The icon component to display inside the button
- style: Additional styles for the button
- onPress: Function to call when the button is pressed
- onHoverTitle: Function to call when the button is hovered, to set title
- title: The title to set on hover
- size: Optional size for the icon
------------------------------------------------------------------------------*/
const HeaderButton = ({
    children, 
    style, 
    onPress, 
    onHoverTitle, 
    title, 
    size, 
    disabled, 
    selected
}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [hovered, setHovered] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);
    const [iconSize, setIconSize] = React.useState(size ?? getIconSize());

    const iconColor = hovered ? theme.actionButton : theme.button;
    

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
                onHoverTitle && onHoverTitle(title);
            }}
            onMouseLeave={() => {
            setHovered(false);
            onHoverTitle && onHoverTitle('');
            }}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
        >
            {React.cloneElement(
                children, 
                {
                    color: disabled ? theme.text : iconColor, 
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