import React, { useState } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

interface HoverableCardProps extends PressableProps {
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean; hovered: boolean }) => StyleProp<ViewStyle>);
  hoverStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export default function HoverableCard({ style, hoverStyle, children, ...props }: HoverableCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      {...props}
      style={({ pressed }) => {
        const baseStyle = typeof style === 'function' ? style({ pressed, hovered: isHovered }) : style;
        return [baseStyle, isHovered && hoverStyle];
      }}
      // @ts-ignore - React Native Web supporte ces événements
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Pressable>
  );
}
