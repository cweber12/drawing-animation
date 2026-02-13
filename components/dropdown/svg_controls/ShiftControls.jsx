// components/ShiftControls.jsx
import React, { useState } from 'react';
import { useShiftFactors } from '../../../context/ShiftFactorsContext';
import { Colors } from '../../../constants/Colors';
import { 
    View, 
    Text, 
    TouchableOpacity,
    useColorScheme,
    StyleSheet,
} from 'react-native';
import './Controls.css';
import { list } from '@aws-amplify/storage';

const BODY_PARTS = [
    { id: 'torsoShift', label: 'Torso' },
    { id: 'headShift', label: 'Head' },
    { id: 'shoulderShift', label: 'Shoulders' },
    { id: 'elbowShift', label: 'Elbows' },
    { id: 'wristShift', label: 'Hands' },
    { id: 'hipShift', label: 'Hips' },
    { id: 'kneeShift', label: 'Knees' },
    { id: 'ankleShift', label: 'Ankles' },
    { id: 'footShift', label: 'Feet' },
];

export default function ShiftControls() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  const { factors, updateFactor } = useShiftFactors();
  const [selected, setSelected] = useState(BODY_PARTS[0].id);

  const current = factors[selected] || { x: 0, y: 0 };

  function setAxis(axis, value) {
    const next = { x: current.x, y: current.y, [axis]: Number(value) };
    updateFactor(selected, next);
  }

  return (
    <View
        style={{ 
            ...styles.mainWrapper,
            backgroundColor: theme.listItemBackground,
            }}>
        <View style={{maxHeight: 300, overflowY: 'auto'}}>
            {BODY_PARTS.map((p) => {
                const isSelected = selected === p.id;
                return (
                <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelected(p.id)}
                    onMouseEnter={(e) => (
                        e.currentTarget.style.backgroundColor = isSelected ? theme.actionButtonHover : theme.listItemBackgroundHover,
                        e.currentTarget.style.color = isSelected ? theme.actionButtonText : theme.text
                    )}
                    onMouseLeave={(e) => (
                        e.currentTarget.style.backgroundColor = isSelected ? theme.actionButton : 'transparent',
                        e.currentTarget.style.color = isSelected ? theme.actionButtonText : theme.text
                    )}
                    style={[
                        styles.button,
                        {
                            backgroundColor: isSelected ? theme.actionButton : 'transparent',
                        },
                    ]}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.buttonText, 
                            {color: isSelected ? theme.actionButtonText : theme.text,}
                        ]}>
                    {p.label}
                    </Text>
                </TouchableOpacity>
                );
            })}
        </View>

        <View style={[styles.sliders, { color: theme.text }]}>
            <View style={styles.sliderWrapper}>
            <Text style={[styles.text, { color: theme.text }]}>X </Text>
            <input
                className="range"
                style={{ '--slider-color': theme.actionButton }}
                type="range"
                min={-10}
                max={10}
                step={0.1}
                value={current.x}
                onChange={(e) => setAxis('x', e.target.value)}
            />
            </View>

            <View style={styles.sliderWrapper}>
                <Text style={[styles.text, { color: theme.text }]}>Y </Text>
                <input
                    className="range"
                    style={{ '--slider-color': theme.actionButton }}
                    type="range"
                    min={-10}
                    max={10}
                    step={0.1}
                    value={current.y}
                    onChange={(e) => setAxis('y', e.target.value)}
                />
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    mainWrapper: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column', 
        gap: 12,
        minWidth: 240,
    },

    button: {
        display: 'block',
        width: '100%',
        marginBottom: 6,
        padding: '6px 8px',
        textAlign: 'left',
        cursor: 'pointer',
        paddingHorizontal: 24,
        paddingVertical: 8,
    },

    buttonText: {
        fontFamily: 'Segoe UI',
        fontSize: 18,
    },

    text: {
        fontFamily: 'Segoe UI',
    },

    sliders: {
        flex: 1, 
        minWidth: 180, 
        paddingHorizontal: 24,
        paddingVertical: 12,
    },

    sliderWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    slider: {
        width: '100%',
        marginTop: 6,
    }
});