import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Transaction } from '../store/slices/transactionSlice';

// Define the shape of the data this form will handle
type TransactionFormData = Omit<Transaction, '_id' | 'date'>;

// Define the props the component will accept
interface TransactionFormProps {
  initialValues?: TransactionFormData;
  onSubmit: (data: TransactionFormData) => void;
  isLoading: boolean;
  submitButtonText?: string;
}

export default function TransactionForm({
  initialValues,
  onSubmit,
  isLoading,
  submitButtonText = 'Save Transaction'
}: TransactionFormProps) {
  
  // State for each form field
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // This effect runs when the component mounts. If initialValues are provided (for editing),
  // it populates the form fields with that data.
  useEffect(() => {
    if (initialValues) {
      setType(initialValues.type);
      setAmount(String(initialValues.amount));
      setCategory(initialValues.category);
      setDescription(initialValues.description || '');
    }
  }, [initialValues]);

  const handleSubmit = () => {
    // Basic form validation
    if (!amount || !category) {
      Alert.alert('Missing Information', 'Please fill in the amount and category.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid, positive number for the amount.');
      return;
    }

    // Call the onSubmit function passed from the parent screen
    onSubmit({
      amount: numericAmount,
      type,
      category,
      description,
    });
  };

  return (
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

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center"
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center text-lg font-bold">
            {submitButtonText}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}