import { StyleSheet } from 'react-native'
import { Link } from 'expo-router';
import React from 'react'
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

const LinkButton = ({ href, children}) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;
    const [hovered, setHovered] = React.useState(false);
    const [pressed, setPressed] = React.useState(false);

    return (
        <Link
          href={href}
          style={[
              styles.link, 
              { 
                  backgroundColor: pressed ? theme.actionButton : (hovered ? theme.actionButton : theme.button), 
                  color: theme.buttonText,
                  width: pressed? '285px' : '300px',
                  height: pressed? '55px' : '60px',
                  fontSize: pressed? 22 : 24,
              }
          ]}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}

          
      >
          {children}
      </Link>
    )
}

export default LinkButton

const styles = StyleSheet.create({
  link: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        textAlign: 'center',

    }
})