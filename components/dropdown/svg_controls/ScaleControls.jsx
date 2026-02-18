// components/ShiftControls.jsx
import React, { useState } from 'react';
import { useScaleFactors } from '../../../context/ScaleFactorsContext';
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
import ListTile from './ListTile';

const BODY_PARTS = [
    { id: 'headScale', label: 'Head' },
    { id: 'armScale', label: 'Arms' },
    { id: 'handScale', label: 'Hands' },
    { id: 'legScale', label: 'Legs' },
    { id: 'footScale', label: 'Feet' },

];

export default function ScaleControls() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
  const { factors, updateFactor } = useScaleFactors();
  const [selected, setSelected] = useState(BODY_PARTS[0].id);

  const current = factors[selected] || { x: 0, y: 0 };

  function setAxis(axis, value) {
    const next = { x: current.x, y: current.y, [axis]: Number(value) };
    updateFactor(selected, next);
  }

  const mainViewStyle = {
    ...styles.mainWrapper,
    backgroundColor: theme.listItemBackground,
  };

  return (
    <View
        style={mainViewStyle}>
        <View style={styles.list}>
            {BODY_PARTS.map((p) => {
                const isSelected = selected === p.id;
                return (
                <ListTile
                    onPress={() => setSelected(p.id)}
                    selected={isSelected}
                >
                    <Text style={[
                        styles.text, 
                        { color: isSelected ? 
                                theme.listItemBackgroundPressed : 
                                theme.text 
                        }]}> {p.label} </Text>
                </ListTile>
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
                min={0}
                max={10}
                step={0.01}
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
                    min={0}
                    max={10}
                    step={0.01}
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
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },

    list: {
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        gap: 6,
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
        fontSize: 18,
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