// mobile/app/(app)/transaction-details.tsx
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/hooks/useAuth';
import { fetchTransactionById, deleteTransaction } from '@/store/slices/transactionSlice';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionDetailsScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { selectedTransaction, status } = useAppSelector((state) => state.transactions);

  useEffect(() => {
    if (transactionId) {
      dispatch(fetchTransactionById(transactionId));
    }
  }, [transactionId, dispatch]);

  const handleDelete = () => {
    Alert.alert("Delete Transaction", "Are you sure? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => {
          if (transactionId) {
            dispatch(deleteTransaction(transactionId)).unwrap().then(() => router.back());
          }
        } 
      }
    ]);
  };

  if (status === 'loading' || !selectedTransaction) {
    return <ActivityIndicator size="large" className="flex-1" />;
  }

  const isExpense = selectedTransaction.type === 'expense';
  const DetailRow = ({ label, value }: { label: string, value: string }) => (
    <View className="border-t border-gray-100 pt-4 mt-4">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-lg text-gray-800 capitalize">{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen
        options={{
          title: 'Transaction Details',
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} className="mr-2">
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView>
        <View className="p-6">
          <View className="bg-white p-6 rounded-lg shadow-sm">
            <Text className="text-sm text-gray-500">Amount</Text>
            <Text className={`text-4xl font-bold ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
              {isExpense ? '-' : '+'}₹{selectedTransaction.amount.toFixed(2)}
            </Text>
            <DetailRow label="Category" value={selectedTransaction.category} />
            <DetailRow label="Ledger" value={selectedTransaction.ledger} />
            <DetailRow 
              label="Date & Time" 
              value={new Date(selectedTransaction.date).toLocaleString('en-IN')} 
            />
            {selectedTransaction.description && <DetailRow label="Description" value={selectedTransaction.description} />}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}