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
        borderRadius: 10,
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: pressed ? theme.buttonPressed : (hovered ? theme.buttonHover : theme.button),
        border: `6px solid ${theme.buttonText}`,
        color: theme.buttonText,
        width: pressed ? 310 : 320,
        height: pressed ? 64 : 68,
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
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'flex-start', 
        fontSize: pressed ? 22 : 24,
        fontWeight: 'bold',
        transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
        }}>
        {children}
      </Link>
    </Pressable>
  );
};

export default LinkButton;