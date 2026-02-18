import React from 'react';
import { 
    StyleSheet, 
    Text, 
    View, 
    TouchableOpacity, 
    useColorScheme
} from 'react-native';
import { Colors } from '../../../constants/Colors';

export default function ListTile({ children, onPress, style, selected }) {
    const [hovered, setHovered] = React.useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const listTileStyle = {
        ...styles.listItem,
        backgroundColor: selected ? (
            hovered ? theme.actionButtonHover : theme.actionButton ) : (
            hovered ? theme.listItemBackgroundHover : 'transparent'
        ),
    }
    return (
        <TouchableOpacity 
            style={[listTileStyle, style]}
            onPress={onPress}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {children}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    listItem: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        paddingBottom: 8,
        paddingHorizontal: 12,
        gap: 12,
        backgroundColor: 'transparent',
    },

    text: {
        fontFamily: 'Segoe UI',
        fontSize: 18,
    },
});