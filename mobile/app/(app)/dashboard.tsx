// mobile/app/(app)/dashboard.tsx
import React, { useEffect, useMemo } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SummaryCards from '../../components/SummaryCards';
import TransactionItem from '../../components/TransactionItem';
import { RootState } from '../../store/store';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { items: allTransactions, status } = useAppSelector((state: RootState) => state.transactions);
  const user = useAppSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchTransactions());
    }
  }, [dispatch, isFocused]);
  
  // --- THIS IS THE UPDATED LOGIC ---
  // A personal transaction is one that has no customer linked
  const personalTransactions = useMemo(() => {
    return allTransactions.filter(t => !t.customer);
  }, [allTransactions]);
  
  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    return personalTransactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.totalIncome += t.amount;
        if (t.type === 'expense') acc.totalExpense += t.amount;
        acc.netBalance = acc.totalIncome - acc.totalExpense;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, netBalance: 0 }
    );
  }, [personalTransactions]);

  const ListHeader = () => (
    <View>
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">Hi, {user?.name}!</Text>
        <Text className="text-lg text-gray-500">Your Personal Dashboard</Text>
      </View>
      <SummaryCards 
        netBalance={netBalance} 
        totalIncome={totalIncome} 
        totalExpense={totalExpense} 
      />
      <View className="px-6 mt-8">
        {/* --- THIS LINK IS UPDATED (no params) --- */}
        <Link href="/add-transaction" asChild>
          <TouchableOpacity className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center shadow-lg">
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-2">Add New Transaction</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <Text className="text-xl font-bold text-gray-700 mt-8 px-6 mb-2">
        Recent Personal Transactions
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {status === 'loading' && !allTransactions.length ? (
        <ActivityIndicator size="large" className="flex-1"/>
      ) : (
        <FlatList
          data={personalTransactions}
          renderItem={({ item }) => <TransactionItem item={item} />}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={() => (
            <Text className="text-center text-gray-500 mt-10 px-6">No personal transactions yet. Tap the button above to add one!</Text>
          )}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </SafeAreaView>
  );
}