import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

const HeaderButton = ({children, style, onPress}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [hovered, setHovered] = React.useState(false);
    const iconColor = hovered ? theme.actionButton : theme.text;
  return (
    <TouchableOpacity 
        onPress={onPress}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
    >
        {React.cloneElement(children, {color: iconColor})}
    </TouchableOpacity>
  )
}

export default HeaderButton

const styles = StyleSheet.create({})