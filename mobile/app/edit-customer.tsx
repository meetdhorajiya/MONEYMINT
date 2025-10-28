// mobile/app/edit-customer.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/hooks/useAuth';
import { updateCustomer } from '@/store/slices/customerSlice';
import { RootState } from '@/store/store';
import { ScreenContainer, Surface } from '@/components/ui/ScreenContainer';
import { useTheme } from '@/components/ThemeProvider';

export default function EditCustomerScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const { theme } = useTheme();

  const customer = useAppSelector((state: RootState) =>
    state.customers.items.find((c) => c._id === customerId),
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
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <Stack.Screen options={{ title: 'Edit Customer' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
          <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Customer not found. Go back to the list and try again.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const inputStyle = {
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.textPrimary,
    marginTop: 12,
  } as const;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ title: 'Edit Customer' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48, gap: 24 }}
        >
          <View>
            <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: '800' }}>Edit customer</Text>
            <Text style={{ color: theme.textSecondary, marginTop: 8 }}>
              Update the name of this customer. Transactions linked to them stay intact.
            </Text>
          </View>

          <Surface>
            <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600' }}>Customer name</Text>
            <TextInput
              style={inputStyle}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="e.g., Keval Shah"
              placeholderTextColor={theme.textSecondary}
              autoFocus
              returnKeyType="done"
            />
            <Text style={{ color: theme.textSecondary, marginTop: 12, fontSize: 13 }}>
              This name is shown wherever customer transactions appear.
            </Text>
          </Surface>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.85}
            style={{
              backgroundColor: theme.accent,
              borderRadius: 22,
              paddingVertical: 18,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? <ActivityIndicator color={theme.onAccent} /> : null}
            <Text style={{ color: theme.onAccent, fontSize: 17, fontWeight: '700' }}>Update Customer</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}