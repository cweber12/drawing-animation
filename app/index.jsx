import { StyleSheet, useColorScheme} from 'react-native'
import React, { useEffect, useNavigate, useRouter } from 'react'
import { Link } from 'expo-router'
import ThemedView from '../components/themed_components/ThemedView';
import { Colors } from '../constants/Colors';

const Home = () => {

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    
    /* Automatically navigate to sketchPage on load 
    ----------------------------------------------------------------------------
    Other link on home page is not active yet, this makes it easier to access
    the working part of the app during development
    --------------------------------------------------------------------------*/
    const router = useRouter();

    useEffect(() => {
        router.replace('/sketchPage');
    }, [router]);
    
    return null; // Temporarily disable home page

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