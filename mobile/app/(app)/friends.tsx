// mobile/app/(app)/friends.tsx

import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SummaryCards from '../../components/SummaryCards';
import { useIsFocused } from '@react-navigation/native';
import TransactionItem from '../../components/TransactionItem'; // <-- Import the new component

export default function FriendsScreen() {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { items: allTransactions, status } = useAppSelector((state) => state.transactions);

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchTransactions());
    }
  }, [dispatch, isFocused]);

  const friendTransactions = allTransactions.filter(t => t.ledger === 'friend');
  const totalIncome = friendTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = friendTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const ListHeader = () => (
    <View>
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">Friends</Text>
      </View>
      <View className="mb-4">
        <SummaryCards netBalance={netBalance} totalIncome={totalIncome} totalExpense={totalExpense} />
      </View>
      <View className="px-6 mt-2 mb-4">
        <Link 
          href={{ pathname: "/add-transaction", params: { ledgerType: 'friend' } }} 
          asChild
        >
          <TouchableOpacity className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center shadow-lg">
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-2">Add New Transaction</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {status === 'loading' && !allTransactions.length ? (
        <ActivityIndicator size="large" className="flex-1"/>
      ) : (
        <FlatList
          data={friendTransactions}
          renderItem={({ item }) => <TransactionItem item={item} />} // <-- Use the imported component
          keyExtractor={(item) => item._id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={() => (
            <Text className="text-center text-gray-500 mt-10">No transactions found for friends.</Text>
          )}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </SafeAreaView>
  );
}