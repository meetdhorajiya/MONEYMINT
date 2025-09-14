import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { items: transactions, status } = useAppSelector((state) => state.transactions);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (isFocused) {
      dispatch(fetchTransactions());
    }
  }, [dispatch, isFocused]);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netBalance = totalIncome - totalExpense;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="p-6">
          <Text className="text-3xl font-bold text-gray-800">Hi, {user?.name}!</Text>
          <Text className="text-lg text-gray-500">Welcome to your financial dashboard.</Text>
        </View>

        {/* Summary Cards */}
        <View className="px-6 space-y-4">
          <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Text className="text-lg font-semibold text-gray-600">Net Balance</Text>
            {status === 'loading' ? (
              <ActivityIndicator className="mt-2" />
            ) : (
              <Text className={`text-3xl font-bold mt-1 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{netBalance.toFixed(2)}
              </Text>
            )}
          </View>
          
          <View className="flex-row space-x-4">
            <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <Text className="text-md font-semibold text-gray-600">Total Income</Text>
              <Text className="text-2xl font-bold text-green-600 mt-1">₹{totalIncome.toFixed(2)}</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <Text className="text-md font-semibold text-gray-600">Total Expense</Text>
              <Text className="text-2xl font-bold text-red-600 mt-1">₹{totalExpense.toFixed(2)}</Text>
            </View>
          </View>
        </View>
        
        {/* Add Transaction Button */}
        <View className="px-6 mt-8">
          <Link href="/add-transaction" asChild>
            <TouchableOpacity className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center shadow-lg">
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">Add New Transaction</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Latest Transaction Preview */}
        {transactions.length > 0 && (
            <View className="px-6 mt-8">
                <Text className="text-xl font-bold text-gray-700 mb-2">Latest Transaction</Text>
                <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row justify-between items-center">
                    <View>
                        <Text className="text-base font-semibold capitalize">{transactions[0].category}</Text>
                        <Text className="text-sm text-gray-500">{new Date(transactions[0].date).toLocaleDateString()}</Text>
                    </View>
                    <Text className={`font-bold text-lg ${transactions[0].type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                        {transactions[0].type === 'expense' ? '-' : '+'}₹{transactions[0].amount.toFixed(2)}
                    </Text>
                </View>
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}