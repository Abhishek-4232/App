import {React,  useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = 'https://app-oq9q.onrender.com/api';

const CreateOrder = () => {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState([{ productId: '', quantity: '' }]);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/products`);
      return data;
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const { data } = await axios.post(`${API_URL}/orders`, orderData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('orders');
      Alert.alert('Success', 'Order created successfully');
      router.back();
    },
    onError: (error) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create order');
    }
  });

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: '' }]);
  };

  const handleRemoveProduct = (index) => {
    if (selectedProducts.length > 1) {
      const newProducts = selectedProducts.filter((_, i) => i !== index);
      setSelectedProducts(newProducts);
    }
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...selectedProducts];
    newProducts[index][field] = value;
    setSelectedProducts(newProducts);
  };

  const handleSubmit = () => {
    const orderData = {
      products: selectedProducts.map(item => ({
        product: item.productId,
        quantity: Number(item.quantity)
      })),
      createdBy: 'staff-1' // In a real app, this would come from auth
    };

    // Validate fields
    const hasEmptyFields = selectedProducts.some(
      item => !item.productId || !item.quantity
    );
    if (hasEmptyFields) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    createOrderMutation.mutate(orderData);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Order</Text>

      {selectedProducts.map((item, index) => (
        <View key={index} style={styles.productContainer}>
          <View style={styles.productHeader}>
            <Text style={styles.productTitle}>Product {index + 1}</Text>
            {index > 0 && (
              <TouchableOpacity
                onPress={() => handleRemoveProduct(index)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select Product</Text>
            <View style={styles.pickerContainer}>
              {products?.map((product) => (
                <TouchableOpacity
                  key={product._id}
                  style={[
                    styles.productOption,
                    item.productId === product._id && styles.selectedOption,
                  ]}
                  onPress={() => handleProductChange(index, 'productId', product._id)}
                >
                  <Text
                    style={[
                      styles.productOptionText,
                      item.productId === product._id && styles.selectedOptionText,
                    ]}
                  >
                    {product.name} (Stock: {product.quantity})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={item.quantity}
              onChangeText={(value) => handleProductChange(index, 'quantity', value)}
              keyboardType="numeric"
              placeholder="Enter quantity"
            />
          </View>
        </View>
      ))}

      <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Another Product</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit}
        style={[
          styles.submitButton,
          createOrderMutation.isLoading && styles.disabledButton,
        ]}
        disabled={createOrderMutation.isLoading}
      >
        <Text style={styles.submitButtonText}>
          {createOrderMutation.isLoading ? 'Creating...' : 'Create Order'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
  productContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    overflow: 'hidden',
  },
  productOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  selectedOption: {
    backgroundColor: '#e0e7ff',
  },
  productOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#4f46e5',
    fontWeight: '500',
  },
  addButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default CreateOrder;
