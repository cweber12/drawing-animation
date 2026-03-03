import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import LinkButton from '../button/LinkButton';
import { FaRegPenToSquare } from "react-icons/fa6";
import { FaPersonThroughWindow } from "react-icons/fa6";
import { FaSliders } from "react-icons/fa6";


import { Colors } from '../../constants/Colors';


const HomeOptionButtons = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    return (

        <View style={{
            ...styles.mainWrapper, 
            backgroundColor: theme.actionButtonHover,
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
                    SKETCH CANVAS
                </Text>
            </LinkButton>

            <LinkButton  href="/capture" >
                <FaPersonThroughWindow size={24} />
                <Text style={{...styles.text, color: theme.text,}}>
                    MOTION CAPTURE
                </Text>
            </LinkButton>

            <LinkButton href="/console" >
                <FaSliders size={24}/>
                <Text style={{...styles.text, color: theme.text,}}>
                    ANIMATION CONSOLE
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
        fontSize: 18, 
        fontFamily: 'Segoe UI', 
    },
});