// mobile/components/TransactionItem.tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { Transaction } from '../store/slices/transactionSlice';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useTheme } from './ThemeProvider';
import { useAppSelector } from '../hooks/useAuth';

export default function TransactionItem({ item }: { item: Transaction }) {
  const isExpense = item.type === 'expense';
  const sign = isExpense ? '-' : '+';
  const iconName = isExpense ? 'trending-down' : 'trending-up';
  const { theme } = useTheme();
  const customers = useAppSelector((state) => state.customers.items);

  const ledgerLabel = useMemo(() => {
    if (!item.customer) return 'Personal';
    return customers.find((customer) => customer._id === item.customer)?.name ?? 'Linked customer';
  }, [customers, item.customer]);

  return (
    <Link
      href={{
        pathname: '/transaction-details',
        params: { transactionId: item._id },
      }}
      asChild
    >
      <Pressable
        style={{
          backgroundColor: theme.surface,
          marginHorizontal: 24,
          marginBottom: 16,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.border,
          paddingVertical: 16,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: isExpense ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.15)',
            padding: 10,
            borderRadius: 16,
            marginRight: 16,
          }}
        >
          <Ionicons
            name={iconName}
            size={22}
            color={isExpense ? theme.danger : theme.success}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: 16,
              fontWeight: '700',
              textTransform: 'capitalize',
            }}
            numberOfLines={1}
          >
            {item.category}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              marginTop: 4,
            }}
          >
            {new Date(item.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              color: isExpense ? theme.danger : theme.success,
              fontSize: 18,
              fontWeight: '800',
            }}
          >
            {sign}₹{item.amount.toFixed(2)}
          </Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
            {ledgerLabel}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}