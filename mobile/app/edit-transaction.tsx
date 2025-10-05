import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Alert, Platform,
  KeyboardAvoidingView, ActivityIndicator, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '@/hooks/useAuth';
import { updateTransaction, Transaction } from '@/store/slices/transactionSlice';

type TransactionParams = { [K in keyof Transaction]: string };

export default function EditTransactionScreen() {
  const params = useLocalSearchParams<TransactionParams>();
  
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  // This effect now runs only ONCE to pre-fill the form
  useEffect(() => {
    setType(params.type === 'income' ? 'income' : 'expense');
    setAmount(params.amount || '');
    setCategory(params.category || '');
    setDescription(params.description || '');
  }, []); // The empty dependency array is the fix

  const handleUpdateTransaction = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
      return;
    }

    setIsLoading(true);
    const updatedData: Omit<Transaction, 'user'> = {
      _id: params._id!,
      amount: numericAmount,
      type,
      category,
      description,
      ledger: params.ledger!,
      date: params.date!,
    };
    try {
      await dispatch(updateTransaction(updatedData)).unwrap();
      router.back();
    } catch (error: any) {
      Alert.alert('Error Updating', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Edit Transaction' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="p-6">
            <View className="flex-row mb-6 bg-gray-200 rounded-lg p-1">
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
              placeholder="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric"
            />
            <TextInput
              className="bg-white p-4 rounded-lg mb-4 text-lg border border-gray-200"
              placeholder="Category" value={category} onChangeText={setCategory} autoCapitalize="words"
            />
            <TextInput
              className="bg-white p-4 rounded-lg mb-6 text-lg border border-gray-200 h-24"
              placeholder="Remark / Description" value={description} onChangeText={setDescription} multiline
            />
            
            <Pressable
              className="bg-blue-600 p-4 rounded-lg"
              onPress={handleUpdateTransaction}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-bold text-lg">Update Transaction</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  selectedButton: { backgroundColor: 'white', elevation: 2 },
  unselectedButton: { backgroundColor: 'transparent' },
});