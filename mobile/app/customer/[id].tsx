// mobile/app/customer/[id].tsx

import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, Link } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { RootState } from '../../store/store';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import TransactionItem from '../../components/TransactionItem';
import SummaryCards from '../../components/SummaryCards';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();

  // Get customer details from customerSlice
  const customer = useAppSelector((state: RootState) => 
    state.customers.items.find(c => c._id === id)
  );
  
  // Get all transactions from transactionSlice
  const { items: allTransactions, status } = useAppSelector((state: RootState) => state.transactions);

  // Fetch transactions when the screen is focused
  useEffect(() => {
    if (isFocused) {
      dispatch(fetchTransactions());
    }
  }, [dispatch, isFocused]);

  // --- FILTER FOR THIS CUSTOMER ONLY ---
  const customerTransactions = useMemo(() => {
    return allTransactions
      .filter(t => t.customer === id) // Filter by customer ID
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, id]);

  // --- CALCULATE TOTALS FOR THIS CUSTOMER ---
  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    return customerTransactions.reduce(
      (acc, t) => {
        // 'income' = customer paid you
        if (t.type === 'income') acc.totalIncome += t.amount;
        // 'expense' = you paid customer
        if (t.type === 'expense') acc.totalExpense += t.amount;
        
        acc.netBalance = acc.totalIncome - acc.totalExpense;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, netBalance: 0 }
    );
  }, [customerTransactions]);

  const ListHeader = () => (
    <View>
      {/* Customer Info */}
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">{customer?.name}</Text>
        <Text className="text-lg text-gray-500">{customer?.phone}</Text>
      </View>
      
      {/* Summary Cards */}
      <SummaryCards 
        netBalance={netBalance} 
        totalIncome={totalIncome} 
        totalExpense={totalExpense} 
      />
      
      {/* Button to add a new transaction FOR THIS CUSTOMER */}
      <View className="px-6 mt-8">
        <Link 
          href={{ 
            pathname: "/add-transaction", 
            // Pass the customerId to pre-link the transaction
            params: { customerId: id } 
          }} 
          asChild
        >
          <Pressable className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center shadow-lg">
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-2">Add Transaction</Text>
          </Pressable>
        </Link>
      </View>
      
      <Text className="text-xl font-bold text-gray-700 mt-8 px-6 mb-2">
        Transaction History
      </Text>
    </View>
  );

  if (!customer) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Text>Customer not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: customer.name }} />
      
      {status === 'loading' && !allTransactions.length ? (
        <ActivityIndicator size="large" className="flex-1"/>
      ) : (
        <FlatList
          data={customerTransactions}
          renderItem={({ item }) => <TransactionItem item={item} />}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={() => (
            <Text className="text-center text-gray-500 mt-10 px-6">
              No transactions found for {customer.name}.
            </Text>
          )}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </SafeAreaView>
  );
}