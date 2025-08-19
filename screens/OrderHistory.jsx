import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'https://app-oq9q.onrender.com/api';
const STAFF_ID = 'staff-1'; // In a real app, this would come from auth

const OrderHistory = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['staffOrders'],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${API_URL}/orders/staff/${STAFF_ID}`);
        return data || [];
      } catch (err) {
        console.error('Error fetching orders:', err);
        throw err;
      }
    }
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading orders. Please try again later.</Text>
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No orders found.</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return {
          bg: '#fef3c7',
          text: '#92400e'
        };
      case 'Processed':
        return {
          bg: '#e0e7ff',
          text: '#4338ca'
        };
      case 'Shipped':
        return {
          bg: '#d1fae5',
          text: '#065f46'
        };
      default:
        return {
          bg: '#f3f4f6',
          text: '#1f2937'
        };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        renderItem={({ item }) => {
          const statusColor = getStatusColor(item.status);
          return (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>
                  Order #{(item._id?.toString() || '').slice(-6)}
                </Text>
                <View
                  style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
                >
                  <Text style={[styles.statusText, { color: statusColor.text }]}>
                    {item.status || 'Unknown'}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <Text style={styles.detailLabel}>
                  Total Items:{' '}
                  <Text style={styles.detailValue}>
                    {item.totalItems || 0}
                  </Text>
                </Text>
                <Text style={styles.detailLabel}>
                  Date:{' '}
                  <Text style={styles.detailValue}>
                    {item.createdAt 
                      ? new Date(item.createdAt).toLocaleDateString()
                      : 'Unknown date'}
                  </Text>
                </Text>
              </View>

              <View style={styles.productList}>
                <Text style={styles.productListTitle}>Products:</Text>
                {Array.isArray(item.products) && item.products.map((product, index) => (
                  <Text key={index} style={styles.productItem}>
                    • {product?.product?.name || 'Unknown product'} x {product?.quantity || 0}
                  </Text>
                ))}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 12,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    color: '#1f2937',
    fontWeight: '500',
  },
  productList: {
    marginTop: 8,
  },
  productListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  productItem: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

export default OrderHistory;
