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
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
          borderRadius: 10,
          marginBottom: 10,
          textAlign: 'center',
          backgroundColor: pressed ? theme.buttonPressed : (hovered ? theme.buttonHover : theme.button),
          border: `5px solid ${theme.buttonText}`,
          color: theme.buttonText,
          width: pressed ? 330 : 340,
          height: pressed ? 64 : 68,
          transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
          cursor: 'pointer',
        }}
      >
        {children}
      </Pressable>
    </Link>
  );
};

export default LinkButton;