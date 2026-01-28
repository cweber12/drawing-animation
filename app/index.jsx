import { StyleSheet, useColorScheme} from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import ThemedView from '../components/themed_components/ThemedView';
import { Colors } from '../constants/Colors';

const Home = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    return (
        <>
            <ThemedView style={styles.container}>
                <Link 
                    href="/sketchPage" 
                    style={[styles.link, { backgroundColor: theme.button, color: theme.buttonText }]}
                >
                    Sketch 
                </Link>
                <Link 
                    href="/viewSavedPoses" 
                    style={[styles.link, { backgroundColor: theme.button, color: theme.buttonText }]}
                >
                    View Saved Animations
                </Link>
            </ThemedView>
        </>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    link: {
        fontSize: 18,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        width: 300,
        textAlign: 'center',
    }
})