import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import LinkButton from '../button/LinkButton';
import { FaRegPenToSquare } from "react-icons/fa6";
import { RiBodyScanLine } from "react-icons/ri";
import { RxTransform } from "react-icons/rx";
import { Colors } from '../../constants/Colors';


const HomeOptionButtons = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (

        <View style={{
            ...styles.mainWrapper, 
            backgroundColor: theme.controlsBackground, 
            borderLeft: `1px solid ${theme.border}`, 
            borderRight: `1px solid ${theme.border}`,
            borderBottom: `1px solid ${theme.border}`,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            marginBottom: 24,
            position: 'absolute',
            top: 0,
            left: 0, }}>
            
            <LinkButton  href="/sketch" >
                <FaRegPenToSquare size={24} />
                <Text style={{...styles.text, color: theme.text,}}>
                    Sketch Canvas
                </Text>
            </LinkButton>

            <LinkButton  href="/capture" >
                <RiBodyScanLine size={32} />
                <Text style={{...styles.text, color: theme.text,}}>
                    Motion Capture
                </Text>
            </LinkButton>

            <LinkButton href="/console" >
                <RxTransform size={32}/>
                <Text style={{...styles.text, color: theme.text,}}>
                    Animation Console
                </Text>
            </LinkButton>

        </View>
    )
}

export default HomeOptionButtons;

const styles = StyleSheet.create({
    mainWrapper: {
        display: 'flex',
        flexWrap: 'wrap', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginLeft: 24,
        gap: 24,
        padding: 24,
    },

    text: {
        fontSize: 24, 
        fontFamily: 'Segoe UI', 
    },
});