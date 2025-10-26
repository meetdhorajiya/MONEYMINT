// mobile/app/add-customer.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../hooks/useAuth';
import { addCustomer } from '../store/slices/customerSlice';

export default function AddCustomerScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [name, setName] = useState('');
  // const [phone, setPhone] = useState(''); // <-- Removed phone state
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name || name.trim() === '') {
      Alert.alert('Name Required', 'Please enter a customer name.');
      return;
    }

    setIsLoading(true);
    try {
      // <-- Removed 'phone' from dispatch
      await dispatch(addCustomer({ name: name.trim() })).unwrap();
      router.back(); 
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add customer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Add New Customer' }} />

      <View className="p-6">
        <Text className="text-lg text-gray-600 mb-2">Customer Name</Text>
        <TextInput
          className="bg-white p-4 rounded-lg mb-6 text-lg border border-gray-200"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholder="e.g., Keval Shah"
          autoFocus={true}
        />
        
        {/* <-- Removed the Phone Number TextInput --> */}
        
        <Pressable
          className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center shadow-lg"
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center text-lg font-bold">Save Customer</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}