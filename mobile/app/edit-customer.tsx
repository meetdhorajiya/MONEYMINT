// mobile/app/edit-customer.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { updateCustomer } from '../store/slices/customerSlice';
import { RootState } from '../store/store';

export default function EditCustomerScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  
  const customer = useAppSelector((state: RootState) => 
    state.customers.items.find(c => c._id === customerId)
  );

  const [name, setName] = useState(customer?.name || '');
  // const [phone, setPhone] = useState(customer?.phone || ''); // <-- Removed phone state
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name || name.trim() === '') {
      Alert.alert('Name Required', 'Please enter a customer name.');
      return;
    }
    
    if (!customer) {
      Alert.alert('Error', 'Customer not found. Please go back.');
      return;
    }

    setIsLoading(true);
    try {
      // <-- Removed 'phone' from dispatch
      await dispatch(updateCustomer({ 
        _id: customer._id, 
        name: name.trim(), 
      })).unwrap();
      router.back(); 
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update customer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!customer) {
    // ... (unchanged)
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <Text>Customer not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Edit Customer' }} />

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
            <Text className="text-white text-center text-lg font-bold">Update Customer</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}