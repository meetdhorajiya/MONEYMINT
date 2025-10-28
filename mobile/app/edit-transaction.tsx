import React, { useEffect, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/hooks/useAuth';
import { updateTransaction } from '@/store/slices/transactionSlice';
import { fetchReportSummary } from '@/store/slices/reportSlice';
import { useTheme } from '../components/ThemeProvider';

type TransactionParams = {
  _id?: string;
  amount?: string;
  type?: 'income' | 'expense';
  category?: string;
  description?: string;
  customer?: string;
};

export default function EditTransactionScreen() {
  const params = useLocalSearchParams<TransactionParams>();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme } = useTheme();

  const resolvedCustomerName = useAppSelector((state) =>
    customerId
      ? state.customers.items.find((customer) => customer._id === customerId)?.name ?? null
      : null,
  );

  useEffect(() => {
    setType(params.type === 'income' ? 'income' : 'expense');
    setAmount(params.amount ? String(params.amount) : '');
    setCategory(params.category ?? '');
    setDescription(params.description ?? '');
    setCustomerId(params.customer && params.customer.length ? params.customer : null);
  }, [params.amount, params.category, params.customer, params.description, params.type]);

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

  const handleUpdateTransaction = async () => {
    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid number.');
      return;
    }

    setIsLoading(true);
    if (!params._id) {
      Alert.alert('Missing data', 'Unable to locate the transaction to update.');
      setIsLoading(false);
      return;
    }

    const updatedData = {
      _id: params._id,
      amount: numericAmount,
      type,
      category,
      description,
      customer: customerId,
    };

    try {
      await dispatch(updateTransaction(updatedData)).unwrap();
      dispatch(fetchReportSummary());
      router.back();
    } catch (error: any) {
      Alert.alert('Error updating', error?.message || 'Unable to update transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <Stack.Screen options={{ title: 'Edit Transaction' }} />
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
                onPress={handleUpdateTransaction}
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
                <Text style={{ color: theme.onAccent, fontSize: 17, fontWeight: '700' }}>Update Transaction</Text>
              </TouchableOpacity>
              <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 12, textAlign: 'center' }}>
                  {customerId
                    ? `Updating this transaction for ${resolvedCustomerName ?? 'the linked customer'}.`
                    : 'Updating your personal transaction record.'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}