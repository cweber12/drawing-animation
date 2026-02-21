import React from 'react';
import { View, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { FaDrawPolygon } from "react-icons/fa6";
import { MdInsights } from "react-icons/md";


export default function LibraryToolButtons({ 
    onToggleDebugAnchors, 
    debugAnchors, 

}) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const [hoveredAnchor, setHoveredAnchor] = React.useState(false);

    return (
        <View style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: theme.controlsBackground,
            borderRadius: 8,
        }}>
                <View style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}>
                    <TouchableOpacity
                    style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 48,

                    cursor: 'pointer',
                    }}
                    onPress={onToggleDebugAnchors}
                    onMouseEnter={() => setHoveredAnchor(true)}
                    onMouseLeave={() => setHoveredAnchor(false)}
                    > 
                        <MdInsights
                        size={32} 
                        style={{ marginLeft: 6}}
                        color={debugAnchors ? theme.actionButton : hoveredAnchor ? theme.iconHover : theme.icon}
                        />
                    </TouchableOpacity>


                </View>

        </View>
    )
}