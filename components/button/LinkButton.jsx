import { View, Pressable } from 'react-native';
import { Link } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

const LinkButton = ({ children, href, params }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  return (
    <Link href={href} params={params} asChild>
      <Pressable
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          fontFamily: 'Segoe UI',
          fontWeight: 'bold',
          textAlign: 'center',
          cursor: 'pointer',
          color: hovered ? theme.actionButton : theme.buttonText,
          transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
          height: pressed ? 44 : 48,
          fontSize: pressed ? 16 : 18,
          }}>
        {children} 
      </Pressable>
    </Link>
  );
};

export default LinkButton;

