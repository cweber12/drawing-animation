import React from 'react';
import { View, TouchableOpacity, useColorScheme, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { FaDrawPolygon } from "react-icons/fa6";
import { MdInsights } from "react-icons/md";
import { RiCustomSize, RiDragMoveFill } from "react-icons/ri";
import HeaderButton from '../button/HeaderButton';

export default function LibraryToolButtons({ 
    onToggleDebugAnchors, 
    debugAnchors,
    showShiftControls,
    onToggleShiftControls,
    showScaleControls,
    onToggleScaleControls, 

}) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    const [hoveredAnchor, setHoveredAnchor] = React.useState(false);

    return (
        <View style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 12,
            padding: 12,
        }}>


            <HeaderButton
                onPress={onToggleDebugAnchors}
                selected={debugAnchors}

            > 
                <MdInsights
                size={32} 
                />
            </HeaderButton>

            <HeaderButton
                onPress={onToggleShiftControls}
                selected={showShiftControls}
            >
                <RiDragMoveFill
                    size={32} 
                />
            </HeaderButton>

            <HeaderButton
                onPress={onToggleScaleControls}
                selected={showScaleControls}
            >
                <RiCustomSize
                    size={32} 
                />
            </HeaderButton>

        </View>
    )
}