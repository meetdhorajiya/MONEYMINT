// mobile/app/(app)/customers.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Pressable, Alert, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { fetchCustomers, deleteCustomer, ICustomer } from '../../store/slices/customerSlice';
import { fetchTransactions } from '../../store/slices/transactionSlice'; // 1. Import fetchTransactions
import { RootState } from '../../store/store';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { useTheme } from '../../components/ThemeProvider';

// 2. New interface for our merged data
interface CustomerSummary {
  customer: ICustomer;
  netBalance: number;
}

export default function CustomersScreen() {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const router = useRouter();
  const { theme } = useTheme();
  
  // 3. Get data from BOTH slices
  const { items: customers, status: customerStatus } = useAppSelector((state: RootState) => state.customers);
  const { items: allTransactions, status: transactionStatus } = useAppSelector((state: RootState) => state.transactions);
  
  const [isDeleting, setIsDeleting] = useState(false);

  // 4. Fetch BOTH customers and transactions
  useEffect(() => {
    if (isFocused) {
      dispatch(fetchCustomers());
      dispatch(fetchTransactions());
    }
  }, [dispatch, isFocused]);

  // 5. New 'useMemo' to calculate balances
  const customerSummaryList = useMemo(() => {
    // Create a map to store balances (key: customerId, value: balance)
    const balanceMap = new Map<string, number>();

    // Calculate balances from all transactions
    for (const t of allTransactions) {
      if (t.customer) { // Only process transactions linked to a customer
        const currentBalance = balanceMap.get(t.customer) || 0;
        // 'income' = customer paid you (+)
        // 'expense' = you paid customer (-)
        const balanceChange = (t.type === 'income') ? t.amount : -t.amount;
        balanceMap.set(t.customer, currentBalance + balanceChange);
      }
    }

    // Map customers to their calculated balances
    return customers.map(customer => ({
      customer: customer,
      netBalance: balanceMap.get(customer._id) || 0,
    })).sort((a, b) => a.customer.name.localeCompare(b.customer.name)); // Sort by name

  }, [customers, allTransactions]);

  // ... (ListHeader is unchanged)
  const ListHeader = () => (
    <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
      <Text style={{ color: theme.textSecondary, fontSize: 16, fontWeight: '600', marginTop: 8 }}>
        Relationship manager
      </Text>
      <Text style={{ color: theme.textPrimary, fontSize: 32, fontWeight: '800', marginTop: 4 }}>
        Customers
      </Text>
      <Text style={{ color: theme.textSecondary, marginTop: 12 }}>
        Track outstanding balances and maintain healthy partnerships.
      </Text>

      <Pressable
        onPress={() => router.push('/add-customer')}
        style={{
          backgroundColor: theme.accent,
          marginTop: 24,
          borderRadius: 22,
          paddingVertical: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          shadowColor: theme.accent,
          shadowOpacity: 0.28,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 16 },
          elevation: 6,
        }}
      >
        <Ionicons name="person-add" size={22} color={theme.onAccent} />
        <Text style={{ color: theme.onAccent, fontSize: 17, fontWeight: '700', marginLeft: 10 }}>
          Add New Customer
        </Text>
      </Pressable>

      <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '700', marginTop: 32 }}>
        All Customers
      </Text>
    </View>
  );

  // ... (handleEdit and handleDelete are unchanged)
  const handleEdit = (customerId: string) => {
    router.push({
      pathname: '/edit-customer',
      params: { customerId } 
    });
  };

  const handleDelete = (customer: ICustomer) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete "${customer.name}"? This will delete all of their transactions permanently.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            await dispatch(deleteCustomer(customer._id))
              .unwrap()
              .catch(err => Alert.alert('Error', err.message || 'Failed to delete'));
            setIsDeleting(false);
          },
        },
      ]
    );
  };

  // --- 6. UPDATED CustomerRow component ---
  const CustomerRow = ({ item }: { item: CustomerSummary }) => {
    const { customer, netBalance } = item;
    const balanceColor = netBalance >= 0 ? theme.success : theme.danger;

    return (
      <View
        style={{
          backgroundColor: theme.surface,
          marginHorizontal: 24,
          marginBottom: 16,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 20,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 12 },
          elevation: 6,
        }}
      >
        <Pressable
          onPress={() => router.push({
            pathname: '/customer/[id]',
            params: { id: customer._id }
          })}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          {/* Left Side (Name & Balance) */}
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '700' }}
              numberOfLines={1}
            >
              {customer.name}
            </Text>
            {/* This is the new balance text */}
            <Text
              style={{
                color: balanceColor,
                fontSize: 14,
                fontWeight: '600',
                marginTop: 6,
              }}
            >
              {netBalance > 0 ? `You'll Get ₹${netBalance.toFixed(2)}` :
                netBalance < 0 ? `You'll Give ₹${Math.abs(netBalance).toFixed(2)}` :
                  'Account Settled'}
            </Text>
          </View>
          
          {/* Right Side (Arrow icon) */}
          <View style={{ paddingLeft: 12 }}>
            <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
          </View>
        </Pressable>
        
        {/* Edit/Delete Buttons (unchanged) */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => handleEdit(customer._id)}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.surfaceMuted }}
          >
            <Ionicons name="pencil-outline" size={20} color={theme.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(customer)}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: `${theme.danger}1A` }}
          >
            <Ionicons name="trash-outline" size={20} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 7. Update loading check
  const isLoading = (customerStatus === 'loading' || transactionStatus === 'loading') && !customerSummaryList.length;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {(isLoading || isDeleting) && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.background + 'CC',
            zIndex: 10,
          }}
        >
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      )}

      <FlatList
        data={customerSummaryList}
        renderItem={CustomerRow}
        keyExtractor={(item) => item.customer._id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <Text
            style={{
              color: theme.textSecondary,
              textAlign: 'center',
              marginTop: 32,
              paddingHorizontal: 24,
            }}
          >
            No customers found. Tap the button above to add one!
          </Text>
        )}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}