import { View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

const LinkButton = ({ href, children }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: pressed ? theme.actionButton : (hovered ? theme.actionButton : theme.button),
        color: theme.buttonText,
        width: pressed ? 285 : 300,
        height: pressed ? 55 : 60,
        boxShadow: pressed ? `0 0 1rem #f40202` : ``,
        transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
        cursor: 'pointer',
        
      }}
    >
      <Link 
      href={href} 
      style={{ 
        color: theme.buttonText, 
        textDecorationLine: 'none', 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: pressed ? 22 : 24, 
        transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
        }}>
        {children}
      </Link>
    </Pressable>
  );
};

export default LinkButton;