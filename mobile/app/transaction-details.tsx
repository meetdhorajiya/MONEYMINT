import React, { useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter, Link } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/hooks/useAuth';
import { fetchTransactionById, deleteTransaction, resetSelection } from '@/store/slices/transactionSlice';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

export default function TransactionDetailsScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { selectedTransaction, status } = useAppSelector((state) => state.transactions);

  useEffect(() => {
    if (isFocused && transactionId) {
      dispatch(fetchTransactionById(transactionId));
    }

    return () => {
      if (!isFocused) {
        dispatch(resetSelection());
      }
    };
  }, [transactionId, dispatch, isFocused]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            if (transactionId) {
              dispatch(deleteTransaction(transactionId)).unwrap().then(() => {
                router.back();
              });
            }
          } 
        }
      ]
    );
  };

  // The custom animation is replaced with the standard ActivityIndicator
  if (status === 'loading') {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  // Handle case where fetch is done but no transaction was found
  if (!selectedTransaction) {
    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
            <Text>Transaction not found.</Text>
        </SafeAreaView>
    );
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
            <View className="flex-row gap-5 mr-2">
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
              <Link 
                href={{ 
                  pathname: '/edit-transaction', 
                  params: { ...selectedTransaction } 
                }} 
                asChild
              >
                <TouchableOpacity>
                  <Ionicons name="pencil-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
              </Link>
            </View>
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
              value={new Date(selectedTransaction.date).toLocaleString('en-IN', {
                dateStyle: 'long',
                timeStyle: 'short',
              })} 
            />
            {selectedTransaction.description && (
              <DetailRow label="Description" value={selectedTransaction.description} />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}