import { StyleSheet, useColorScheme, Platform, Image} from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import ThemedView from '../components/themed_components/ThemedView';
import { Colors } from '../constants/Colors';

const Home = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    
    return (
        <>
            <ThemedView 
            style={[
                styles.container, 
                { 
                    justifyContent: 'flex-start', 
                    paddingTop: Platform.OS === 'web' ? 80 : 40, 
                }]}
            >
                <img
                    src="/icon.png"
                    alt="App Icon"
                    style={{ width: "30vw", height: "auto", marginBottom: 32 }}
                />
                <Link 
                    href="/sketchPage" 
                    style={[
                        styles.link, 
                        { 
                            backgroundColor: theme.button, 
                            color: theme.buttonText 
                        }
                    ]}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = theme.actionButton;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = theme.button;
                    }}
                >
                    Sketch 
                </Link>
                <Link
                    href="/viewSavedPoses"
                    style={[
                        styles.link, 
                        { 
                            backgroundColor: theme.button, 
                            color: theme.buttonText 
                        }
                    ]}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = theme.actionButton;
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = theme.button;
                    }}
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        width: 400,
        height: 64,
        textAlign: 'center',

    }
})