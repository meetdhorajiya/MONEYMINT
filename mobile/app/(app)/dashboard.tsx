// mobile/app/(app)/dashboard.tsx
import React, { useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SummaryCards from '../../components/SummaryCards';
import TransactionItem from '../../components/TransactionItem';
import type { RootState } from '../../store/store';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { useTheme } from '../../components/ThemeProvider';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { items: allTransactions, status } = useAppSelector((state: RootState) => state.transactions);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const { theme } = useTheme();

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchTransactions());
    }
  }, [dispatch, isFocused]);

  const personalTransactions = useMemo(() => allTransactions.filter((transaction) => !transaction.customer), [allTransactions]);

  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    return personalTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') acc.totalIncome += transaction.amount;
        if (transaction.type === 'expense') acc.totalExpense += transaction.amount;
        acc.netBalance = acc.totalIncome - acc.totalExpense;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, netBalance: 0 },
    );
  }, [personalTransactions]);

  const ListHeader = () => (
    <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 }}>
      <View
        style={{
          backgroundColor: theme.surface,
          borderRadius: 28,
          padding: 28,
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 16 },
          elevation: 8,
        }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 16, fontWeight: '600' }}>Personal overview</Text>
        <Text
          style={{
            color: theme.textPrimary,
            fontSize: 32,
            fontWeight: '800',
            marginTop: 4,
          }}
        >
          Hi, {user?.name} 👋
        </Text>
        <Text style={{ color: theme.textSecondary, marginTop: 12 }}>
          Keep tracking your money habits. You are doing great!
        </Text>
      </View>

      <View style={{ marginTop: 24 }}>
        <SummaryCards netBalance={netBalance} totalIncome={totalIncome} totalExpense={totalExpense} />
      </View>

      <View style={{ marginTop: 24 }}>
        <Link href="/add-transaction" asChild>
          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              backgroundColor: theme.accent,
              paddingVertical: 18,
              borderRadius: 22,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: theme.accent,
              shadowOpacity: 0.3,
              shadowRadius: 28,
              shadowOffset: { width: 0, height: 18 },
              elevation: 6,
            }}
          >
            <Ionicons name="add-circle" size={24} color={theme.onAccent} />
            <Text style={{ color: theme.onAccent, fontSize: 17, fontWeight: '700', marginLeft: 10 }}>
              New Personal Transaction
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <Text
        style={{
          color: theme.textPrimary,
          fontSize: 20,
          fontWeight: '700',
          marginTop: 32,
        }}
      >
        Recent Personal Transactions
      </Text>
    </View>
  );

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {status === 'loading' && !allTransactions.length ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <FlatList
          data={personalTransactions}
          renderItem={({ item }) => <TransactionItem item={item} />}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={() => (
            <Text
              style={{
                color: theme.textSecondary,
                textAlign: 'center',
                marginTop: 32,
                paddingHorizontal: 24,
              }}
            >
              No personal transactions yet. Tap the button above to add one!
            </Text>
          )}
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}