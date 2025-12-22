import { StyleSheet, useColorScheme} from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import ThemedView from '../components/ThemedView';
import { Colors } from '../constants/Colors';

const Home = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    return (
        <ThemedView style={styles.container}>
            <Link 
                href="/drawWeb" 
                style={[styles.link, { backgroundColor: theme.button, color: theme.buttonText }]}
            >
                Draw
            </Link>
        </ThemedView>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    link: {
        fontSize: 20,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        width: '40%',
        textAlign: 'center',
    }
})