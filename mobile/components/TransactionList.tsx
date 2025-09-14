import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { Transaction } from '../store/slices/transactionSlice';
import { Ionicons } from '@expo/vector-icons';

// --- Sub-component for rendering a single row in the list ---
interface TransactionItemProps {
  item: Transaction;
  onPress?: (item: Transaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ item, onPress }) => {
  const isExpense = item.type === 'expense';
  const amountColor = isExpense ? 'text-red-600' : 'text-green-600';
  const sign = isExpense ? '-' : '+';
  const iconName = isExpense ? 'arrow-down-circle' : 'arrow-up-circle';
  const iconColor = isExpense ? '#DC2626' : '#16A34A'; // red-600 and green-600

  return (
    <TouchableOpacity
      onPress={() => onPress?.(item)}
      className="flex-row items-center p-4 bg-white border-b border-gray-100"
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View className="mr-4">
        <Ionicons name={iconName} size={40} color={iconColor} />
      </View>
      
      {/* Category and Description */}
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800 capitalize">{item.category}</Text>
        {item.description ? (
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>

      {/* Amount and Date */}
      <View className="items-end">
        <Text className={`text-lg font-bold ${amountColor}`}>
          {sign}${item.amount.toFixed(2)}
        </Text>
        <Text className="text-xs text-gray-400 mt-1">
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// --- Main component for rendering the entire list ---
interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  onItemPress?: (item: Transaction) => void;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export default function TransactionList({
  transactions,
  isLoading,
  onItemPress,
  ListEmptyComponent,
}: TransactionListProps) {
  // Show a loading spinner while data is being fetched
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Define how to render each item
  const renderItem: ListRenderItem<Transaction> = ({ item }) => (
    <TransactionItem item={item} onPress={onItemPress} />
  );

  return (
    <FlatList
      data={transactions}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={{ flexGrow: 1 }} // Ensures empty component can be centered
    />
  );
}