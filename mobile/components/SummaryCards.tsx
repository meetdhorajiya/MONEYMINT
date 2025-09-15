// mobile/components/SummaryCards.tsx

import React from 'react';
import { View, Text } from 'react-native';

interface SummaryCardsProps {
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export default function SummaryCards({ netBalance, totalIncome, totalExpense }: SummaryCardsProps) {
  return (
    <View className="px-6 space-y-4">
      {/* Net Balance Card */}
      <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <Text className="text-lg font-semibold text-gray-600">Net Balance</Text>
        <Text className={`text-3xl font-bold mt-1 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ₹{netBalance.toFixed(2)}
        </Text>
      </View>
      
      {/* Income and Expense Cards */}
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
  );
}