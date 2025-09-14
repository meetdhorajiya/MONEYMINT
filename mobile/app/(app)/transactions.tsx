import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { fetchTransactions, Transaction } from '../../store/slices/transactionSlice';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

// A sub-component for rendering a single row in the list for better organization.
const TransactionItem: React.FC<{ item: Transaction }> = ({ item }) => {
  const isExpense = item.type === 'expense';
  const amountColor = isExpense ? 'text-red-600' : 'text-green-600';
  const sign = isExpense ? '-' : '+';
  const iconName = isExpense ? 'arrow-down-circle' : 'arrow-up-circle';
  const iconColor = isExpense ? '#DC2626' : '#16A34A';

  return (
    <View className="flex-row items-center p-4 bg-white border-b border-gray-100">
      <View className="mr-4">
        <Ionicons name={iconName} size={40} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800 capitalize">{item.category}</Text>
        {item.description ? (
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <View className="items-end">
        <Text className={`text-lg font-bold ${amountColor}`}>
          {sign}${item.amount.toFixed(2)}
        </Text>
        <Text className="text-xs text-gray-400 mt-1">
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

// The main screen component.
export default function TransactionsScreen() {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused(); // Hook to check if the screen is currently visible
  const { items: transactions, status } = useAppSelector((state) => state.transactions);

  // Fetch transactions when the screen comes into focus.
  useEffect(() => {
    if (isFocused) {
      dispatch(fetchTransactions());
    }
  }, [dispatch, isFocused]);

  // A component to show when the list is empty.
  const renderEmptyListComponent = () => (
    <View className="flex-1 justify-center items-center bg-gray-50 p-8">
        <Ionicons name="documents-outline" size={64} color="#D1D5DB" />
        <Text className="text-lg text-gray-500 mt-4">No transactions yet.</Text>
        <Text className="text-center text-gray-400 mt-2">Your transaction history will appear here once you add a new entry.</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Screen Header */}
      <View className="flex-row justify-between items-center p-6">
        <Text className="text-3xl font-bold text-gray-800">History</Text>
        <Link href="/add-transaction" asChild>
          <TouchableOpacity className="bg-blue-600 p-2 rounded-full shadow">
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </Link>
      </View>
      
      {/* Show a loading spinner while fetching data */}
      {status === 'loading' ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={({ item }) => <TransactionItem item={item} />}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={renderEmptyListComponent}
          contentContainerStyle={{ flexGrow: 1 }} // Allows the empty component to fill the space
        />
      )}
    </SafeAreaView>
  );
}