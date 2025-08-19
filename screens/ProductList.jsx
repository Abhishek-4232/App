import  React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'https://app-oq9q.onrender.com/api';

const ProductList = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/products`);
      return data;
    }
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.card, item.isLowStock && styles.lowStockCard]}>
            <View>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.sku}>SKU: {item.sku}</Text>
            </View>
            <View>
              <Text style={[styles.quantity, item.isLowStock && styles.lowStockText]}>
                Quantity: {item.quantity}
              </Text>
              <Text style={styles.minStock}>Min Stock: {item.minimumStockLevel}</Text>
            </View>
            {item.isLowStock && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Low Stock</Text>
              </View>
            )}
          </View>
        )}
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
  card: {
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
  lowStockCard: {
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sku: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  quantity: {
    fontSize: 16,
    color: '#059669',
    marginTop: 8,
  },
  lowStockText: {
    color: '#dc2626',
  },
  minStock: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: 'bold',
  },
});

export default ProductList;
