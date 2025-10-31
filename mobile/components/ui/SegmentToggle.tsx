import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../ThemeProvider';

type OptionValue = 'income' | 'expense';

type SegmentToggleProps = {
  value: OptionValue;
  onChange: (nextValue: OptionValue) => void;
  labels?: Record<OptionValue, string>;
};

export function SegmentToggle({ value, onChange, labels }: SegmentToggleProps) {
  const { theme } = useTheme();
  const resolvedLabels: Record<OptionValue, string> = {
    income: labels?.income ?? 'Income (IN)',
    expense: labels?.expense ?? 'Expense (OUT)',
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.surfaceMuted,
        borderRadius: 20,
        padding: 6,
        borderWidth: 1,
        borderColor: theme.border,
        gap: 6,
      }}
    >
      {(Object.keys(resolvedLabels) as OptionValue[]).map((option) => {
        const isActive = option === value;
        const activeColor = option === 'income' ? theme.success : theme.danger;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive ? activeColor : 'transparent',
              borderWidth: 1,
              borderColor: isActive ? activeColor : 'transparent',
            }}
          >
            <Text
              style={{
                color: isActive ? theme.onAccent : theme.textSecondary,
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              {resolvedLabels[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
