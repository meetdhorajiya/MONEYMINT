// mobile/components/TransactionItem.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Transaction } from '../store/slices/transactionSlice';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function TransactionItem({ item }: { item: Transaction }) {
  const isExpense = item.type === 'expense';
  const amountColor = isExpense ? 'text-red-600' : 'text-green-600';
  const sign = isExpense ? '-' : '+';
  const iconName = isExpense ? 'arrow-down-circle' : 'arrow-up-circle';
  const iconColor = isExpense ? '#DC2626' : '#16A34A';

  return (
    <Link 
      href={{ 
        pathname: '/transaction-details', 
        params: { transactionId: item._id } 
      }} 
      asChild
    >
      <Pressable>
        <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
          <View className="mr-4">
            <Ionicons name={iconName} size={40} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-800 capitalize">{item.category}</Text>
            <Text className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</Text>
          </View>
          <Text className={`text-lg font-bold ${amountColor}`}>{sign}₹{item.amount.toFixed(2)}</Text>
        </View>
      </Pressable>
    </Link>
  );
};