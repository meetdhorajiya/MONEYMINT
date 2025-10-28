import React from 'react';
import { View, ViewProps } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeProvider';

type ScreenContainerProps = SafeAreaViewProps & {
  children: React.ReactNode;
};

type SurfaceProps = ViewProps & {
  children: React.ReactNode;
  muted?: boolean;
  highlight?: boolean;
};

export function ScreenContainer({ style, children, ...rest }: ScreenContainerProps) {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      {...rest}
      style={[{ flex: 1, backgroundColor: theme.background }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

export function Surface({ style, children, muted = false, highlight = false, ...rest }: SurfaceProps) {
  const { theme } = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: highlight
            ? theme.accent
            : muted
            ? theme.surfaceMuted
            : theme.surface,
          borderRadius: 24,
          padding: 24,
          borderWidth: highlight ? 0 : 1,
          borderColor: theme.border,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 12 },
          elevation: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
