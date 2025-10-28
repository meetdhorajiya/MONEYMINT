// mobile/app/add-transaction.tsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { SegmentToggle } from '../components/ui/SegmentToggle';
import { useAppDispatch, useAppSelector } from '../hooks/useAuth';
import { addTransaction } from '../store/slices/transactionSlice';
import { useTheme } from '../components/ThemeProvider';

type AddTransactionParams = {
  customerId?: string;
};

export default function AddTransactionScreen() {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { customerId } = useLocalSearchParams<AddTransactionParams>();
  const normalizedCustomerId = useMemo(
    () => (customerId && typeof customerId === 'string' && customerId.length ? customerId : undefined),
    [customerId],
  );
  const customerName = useAppSelector((state) =>
    normalizedCustomerId
      ? state.customers.items.find((customer) => customer._id === normalizedCustomerId)?.name ?? null
      : null,
  );
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useTheme();

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

  const handleSaveTransaction = async () => {
    if (!amount || !category) {
      Alert.alert('Missing information', 'Please enter an amount and a category.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid number.');
      return;
    }

    setIsLoading(true);
    const newTransaction = {
      amount: numericAmount,
      type,
      category,
      description,
      customer: normalizedCustomerId ?? null,
    };

    try {
      await dispatch(addTransaction(newTransaction)).unwrap();
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to save transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: 'New Transaction' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ paddingTop: 12 }}>
            <Text style={{ color: theme.textSecondary, fontWeight: '600', fontSize: 15 }}>Select flow</Text>
            <View style={{ marginTop: 12 }}>
              <SegmentToggle value={type} onChange={setType} />
            </View>

            <View style={{ marginTop: 24 }}>
              <Text style={{ color: theme.textSecondary, fontWeight: '600', fontSize: 15 }}>Amount (₹)</Text>
              <TextInput
                style={inputStyle}
                placeholder="E.g. 1250"
                placeholderTextColor={theme.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>

            <View>
              <Text style={{ color: theme.textSecondary, fontWeight: '600', fontSize: 15, marginTop: 20 }}>Category</Text>
              <TextInput
                style={inputStyle}
                placeholder="E.g. Groceries, Rent, Salary"
                placeholderTextColor={theme.textSecondary}
                value={category}
                onChangeText={setCategory}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View>
              <Text style={{ color: theme.textSecondary, fontWeight: '600', fontSize: 15, marginTop: 20 }}>Notes (optional)</Text>
              <TextInput
                style={{
                  ...inputStyle,
                  height: 120,
                  textAlignVertical: 'top',
                }}
                placeholder="Add a quick remark to remember this transaction"
                placeholderTextColor={theme.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <View style={{ marginTop: 32 }}>
              <TouchableOpacity
                onPress={handleSaveTransaction}
                disabled={isLoading}
                style={{
                  backgroundColor: theme.accent,
                  borderRadius: 22,
                  paddingVertical: 18,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 10,
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? <ActivityIndicator color={theme.onAccent} /> : null}
                <Text style={{ color: theme.onAccent, fontSize: 17, fontWeight: '700' }}>Save Transaction</Text>
              </TouchableOpacity>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 12, textAlign: 'center' }}>
                {normalizedCustomerId
                  ? `Saved for ${customerName ?? 'this customer'}.`
                  : 'Saved to your personal records automatically.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}