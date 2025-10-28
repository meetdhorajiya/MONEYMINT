// mobile/components/SummaryCards.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Surface } from './ui/ScreenContainer';
import { useTheme } from './ThemeProvider';

interface SummaryCardsProps {
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export default function SummaryCards({ netBalance, totalIncome, totalExpense }: SummaryCardsProps) {
  const { theme } = useTheme();
  const isPositive = netBalance >= 0;

  return (
    <View style={{ gap: 16 }}>
      <Surface
        highlight
        style={{
          padding: 28,
          borderRadius: 28,
          borderWidth: 0,
        }}
      >
        <Text style={{ color: theme.onAccent, opacity: 0.85, fontSize: 16, fontWeight: '600' }}>
          Net Balance
        </Text>
        <Text
          style={{
            color: theme.onAccent,
            fontSize: 36,
            fontWeight: '800',
            marginTop: 8,
          }}
        >
          ₹{netBalance.toFixed(2)}
        </Text>
        <Text
          style={{
            color: theme.onAccent,
            marginTop: 8,
            fontSize: 14,
            opacity: 0.85,
          }}
        >
          {isPositive ? 'Great job! Your balance is growing.' : 'Let’s rebalance your spending today.'}
        </Text>
      </Surface>

      <View style={{ flexDirection: 'row', gap: 16 }}>
        <Surface style={{ flex: 1, borderRadius: 24 }}>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 15,
              fontWeight: '600',
            }}
          >
            Total Income
          </Text>
          <Text
            style={{
              color: theme.success,
              fontSize: 28,
              fontWeight: '800',
              marginTop: 6,
            }}
          >
            ₹{totalIncome.toFixed(2)}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
            Inflows recorded this period
          </Text>
        </Surface>
        <Surface style={{ flex: 1, borderRadius: 24 }}>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 15,
              fontWeight: '600',
            }}
          >
            Total Expense
          </Text>
          <Text
            style={{
              color: theme.danger,
              fontSize: 28,
              fontWeight: '800',
              marginTop: 6,
            }}
          >
            ₹{totalExpense.toFixed(2)}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
            Outflows across every ledger
          </Text>
        </Surface>
      </View>
    </View>
  );
}