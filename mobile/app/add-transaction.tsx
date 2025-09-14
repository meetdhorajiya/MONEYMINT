import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../hooks/useAuth';
import { addTransaction } from '../store/slices/transactionSlice';
import { Ionicons } from '@expo/vector-icons';

export default function AddTransactionScreen() {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSaveTransaction = async () => {
    // Basic form validation
    if (!amount || !category) {
      Alert.alert('Missing Information', 'Please fill in both the amount and category.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number for the amount.');
      return;
    }

    setIsLoading(true);

    const newTransaction = {
      amount: numericAmount,
      type,
      category,
      description,
    };

    try {
      // Dispatch the thunk and use .unwrap() to catch potential errors
      await dispatch(addTransaction(newTransaction)).unwrap();
      
      // On success, close the modal
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 p-6">
          {/* Segmented control for Income/Expense */}
          <View className="flex-row mb-6 bg-gray-200 rounded-lg p-1">
            <TouchableOpacity
              className={`flex-1 p-3 rounded-md ${type === 'expense' ? 'bg-white shadow' : ''}`}
              onPress={() => setType('expense')}
            >
              <Text className={`text-center font-bold ${type === 'expense' ? 'text-red-500' : 'text-gray-500'}`}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-3 rounded-md ${type === 'income' ? 'bg-white shadow' : ''}`}
              onPress={() => setType('income')}
            >
              <Text className={`text-center font-bold ${type === 'income' ? 'text-green-500' : 'text-gray-500'}`}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Input Fields */}
          <TextInput
            className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TextInput
            className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
            placeholder="Category (e.g., Food, Salary)"
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            className="bg-white p-4 rounded-lg mb-6 text-lg border border-gray-200 h-24"
            placeholder="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Save Button */}
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center"
            onPress={handleSaveTransaction}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center text-lg font-bold">
                Save Transaction
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}