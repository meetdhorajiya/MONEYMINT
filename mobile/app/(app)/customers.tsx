// mobile/app/(app)/customers.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { fetchCustomers, deleteCustomer, ICustomer } from '../../store/slices/customerSlice';
import { fetchTransactions } from '../../store/slices/transactionSlice'; // 1. Import fetchTransactions
import { RootState } from '../../store/store';

// 2. New interface for our merged data
interface CustomerSummary {
  customer: ICustomer;
  netBalance: number;
}

export default function CustomersScreen() {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const router = useRouter();
  
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
    <View>
      <View className="p-6">
        <Text className="text-3xl font-bold text-gray-800">Customers</Text>
      </View>
      <View className="px-6 mt-2 mb-4">
        <Pressable 
          onPress={() => router.push('/add-customer')}
          className="bg-blue-600 p-4 rounded-lg flex-row justify-center items-center shadow-lg"
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text className="text-white text-lg font-bold ml-2">Add New Customer</Text>
        </Pressable>
      </View>
      <Text className="text-xl font-bold text-gray-700 mt-4 px-6 mb-2">
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
    const balanceColor = netBalance >= 0 ? 'text-green-600' : 'text-red-600';

    return (
      <View className="bg-white p-4 mx-6 mb-3 rounded-lg shadow-sm border border-gray-200">
        <Pressable
          onPress={() => router.push({
            pathname: '/customer/[id]',
            params: { id: customer._id }
          })}
          className="flex-row justify-between items-center"
        >
          {/* Left Side (Name & Balance) */}
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>{customer.name}</Text>
            {/* This is the new balance text */}
            <Text className={`text-sm font-semibold ${balanceColor}`}>
              {netBalance > 0 ? `You'll Get: ₹${netBalance.toFixed(2)}` :
               netBalance < 0 ? `You'll Give: ₹${Math.abs(netBalance).toFixed(2)}` :
               `Settled`}
            </Text>
          </View>
          
          {/* Right Side (Arrow icon) */}
          <View className="pl-2">
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </View>
        </Pressable>
        
        {/* Edit/Delete Buttons (unchanged) */}
        <View className="flex-row justify-end mt-3 pt-3 border-t border-gray-100">
          <TouchableOpacity
            onPress={() => handleEdit(customer._id)}
            className="px-3 py-1 mr-2"
          >
            <Ionicons name="pencil-outline" size={20} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(customer)}
            className="px-3 py-1"
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 7. Update loading check
  const isLoading = (customerStatus === 'loading' || transactionStatus === 'loading') && !customerSummaryList.length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      { (isLoading || isDeleting) ? (
        <View className="absolute inset-0 justify-center items-center bg-gray-50/80 z-10">
          <ActivityIndicator size="large" />
        </View>
      ) : null}

      <FlatList
        data={customerSummaryList} // 8. Use the new summary list
        renderItem={CustomerRow}
        keyExtractor={(item) => item.customer._id} // 9. Get ID from customer object
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <Text className="text-center text-gray-500 mt-10 px-6">
            No customers found. Tap the button above to add one!
          </Text>
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}