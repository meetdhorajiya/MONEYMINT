import React, { useState } from 'react';
import {
  View, Text, TextInput, Alert, Platform,
  KeyboardAvoidingView, ActivityIndicator, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../hooks/useAuth';
import { addTransaction } from '../store/slices/transactionSlice';

export default function AddTransactionScreen() {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { ledgerType } = useLocalSearchParams<{ ledgerType: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSaveTransaction = async () => {
    if (!amount || !category) {
      Alert.alert('Missing Information', 'Please enter an amount and a category.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
      return;
    }

    setIsLoading(true);
    const newTransaction = {
      amount: numericAmount,
      type,
      category,
      description,
      ledger: ledgerType,
    };
    
    try {
      await dispatch(addTransaction(newTransaction)).unwrap();
      router.back();
    } catch (error: any)      {
      Alert.alert('Error', error.message || 'Failed to save transaction.');
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="p-6">
            <View className="flex-row mb-6 bg-gray-200 rounded-lg p-1">
              {/* We now use the 'style' prop for the dynamic part */}
              <Pressable
                className="flex-1 p-3 rounded-md"
                style={type === 'expense' ? styles.selectedButton : styles.unselectedButton}
                onPress={() => setType('expense')}
              >
                <Text className={`text-center font-bold ${type === 'expense' ? 'text-red-500' : 'text-gray-500'}`}>Expense (OUT)</Text>
              </Pressable>
              
              <Pressable
                className="flex-1 p-3 rounded-md"
                style={type === 'income' ? styles.selectedButton : styles.unselectedButton}
                onPress={() => setType('income')}
              >
                <Text className={`text-center font-bold ${type === 'income' ? 'text-green-500' : 'text-gray-500'}`}>Income (IN)</Text>
              </Pressable>
            </View>

            <TextInput
              className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
              placeholder="Amount (₹)"
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            
            <TextInput
              className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
              placeholder="Category (e.g., Food, Jack, Salary)"
              placeholderTextColor="#9CA3AF"
              value={category}
              onChangeText={setCategory}
              autoCapitalize="words"
            />

            <TextInput
              className="bg-white p-4 rounded-lg mb-6 text-lg border border-gray-200 h-24"
              placeholder="Remark / Description (Optional)"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
            />
            
            <Pressable
              className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center"
              onPress={handleSaveTransaction}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center text-lg font-bold">Save Transaction</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Create a StyleSheet for the styles that change
const styles = StyleSheet.create({
  selectedButton: {
    backgroundColor: 'white',
    // You can add shadow styles here if needed for Android/iOS
  },
  unselectedButton: {
    backgroundColor: 'transparent',
  }
});