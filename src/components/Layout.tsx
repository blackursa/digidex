import React from 'react';
import { View, ViewProps } from 'react-native';

interface LayoutProps extends ViewProps {
  children: React.ReactNode;
}

export function Layout({ children, style, ...props }: LayoutProps) {
  return (
    <View 
      style={[
        { 
          flex: 1,
          padding: 20,
          backgroundColor: '#ffffff'
        },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}
