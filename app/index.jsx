import { StyleSheet, View} from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const Home = () => {

    return (
        <View style={styles.container}>
            <Link href="/drawWeb" style={styles.link}>Draw</Link>
        </View>
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
        color: 'white',
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
        marginBottom: 10,
        width: '40%',
        textAlign: 'center',
    }
})