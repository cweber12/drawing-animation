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
          justifyContent: 'space-between',
          fontFamily: 'Segoe UI',
          fontWeight: 'bold',
          textAlign: 'center',
          cursor: 'pointer',
          color: theme.text,
          backgroundColor: hovered ? theme.listItemBackgroundHover : theme.listItemBackground,
          transition: 'all 0.15s cubic-bezier(.4,0,.2,1)',
          height: pressed ? 44 : 48,
          width: pressed ? 280 : 300,
          fontSize: pressed ? 16 : 18,
          paddingHorizontal: 24,
          gap: 8,
          borderRadius: 8,
          }}>
        {children} 
      </Pressable>
    </Link>
  );
};

export default LinkButton;

