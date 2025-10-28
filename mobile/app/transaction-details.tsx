import React, { useEffect, useMemo } from 'react';
import { View, Text, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, Link } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/hooks/useAuth';
import { fetchTransactionById, deleteTransaction, resetSelection } from '@/store/slices/transactionSlice';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { ScreenContainer, Surface } from '../components/ui/ScreenContainer';
import { useTheme } from '../components/ThemeProvider';

export default function TransactionDetailsScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { selectedTransaction, status } = useAppSelector((state) => state.transactions);
  const customers = useAppSelector((state) => state.customers.items);
  const { theme } = useTheme();

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

  const customerName = useMemo(() => {
    if (!selectedTransaction?.customer) return null;
    return customers.find((customer) => customer._id === selectedTransaction.customer)?.name ?? null;
  }, [customers, selectedTransaction]);

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
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }} edges={['left', 'right', 'bottom']}>
        <ActivityIndicator size="large" color={theme.accent} />
      </ScreenContainer>
    );
  }

  // Handle case where fetch is done but no transaction was found
  if (!selectedTransaction) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }} edges={['left', 'right', 'bottom']}>
        <Text style={{ color: theme.textSecondary }}>Transaction not found.</Text>
      </ScreenContainer>
    );
  }

  const isExpense = selectedTransaction.type === 'expense';
  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingTop: 16,
        marginTop: 16,
      }}
    >
      <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '600', marginTop: 6 }}>
        {value}
      </Text>
    </View>
  );

  return (
    <ScreenContainer edges={['left', 'right', 'bottom']}>
      <Stack.Screen
        options={{
          title: 'Transaction Details',
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
                gap: 20,
                marginRight: 12,
              }}
            >
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color={theme.danger} />
              </TouchableOpacity>
              <Link
                href={{
                  pathname: '/edit-transaction',
                  params: {
                    _id: selectedTransaction._id,
                    amount: String(selectedTransaction.amount),
                    type: selectedTransaction.type,
                    category: selectedTransaction.category,
                    description: selectedTransaction.description ?? '',
                    customer: selectedTransaction.customer ?? '',
                  },
                }}
                asChild
              >
                <TouchableOpacity>
                  <Ionicons name="pencil-outline" size={24} color={theme.accent} />
                </TouchableOpacity>
              </Link>
            </View>
          ),
        }}
      />
      <ScrollView>
        <View style={{ padding: 24 }}>
          <Surface>
            <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
              Amount
            </Text>
            <Text
              style={{
                color: isExpense ? theme.danger : theme.success,
                fontSize: 40,
                fontWeight: '800',
              }}
            >
              {isExpense ? '-' : '+'}₹{selectedTransaction.amount.toFixed(2)}
            </Text>

            <DetailRow label="Category" value={selectedTransaction.category} />
            <DetailRow
              label="Date & Time"
              value={new Date(selectedTransaction.date).toLocaleString('en-IN', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            />
            <DetailRow label="Linked To" value={customerName ?? 'Personal records'} />
            {selectedTransaction.description ? (
              <DetailRow label="Notes" value={selectedTransaction.description} />
            ) : null}
          </Surface>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}