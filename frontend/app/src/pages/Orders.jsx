import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'https://app-oq9q.onrender.com/api';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function Orders() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([{ productId: '', quantity: '' }]);

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/products`);
      return data;
    }
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/orders`);
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
      queryClient.invalidateQueries('products');
      setIsCreateModalOpen(false);
      setSelectedProducts([{ productId: '', quantity: '' }]);
    }
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const { data } = await axios.patch(`${API_URL}/orders/${orderId}`, { status });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries('orders');
      toast.success(`Order status updated to ${variables.status}`);
    },
    onError: (error) => {
      toast.error('Failed to update order status: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: '', quantity: '' }]);
  };

  const handleRemoveProduct = (index) => {
    const newProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(newProducts);
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...selectedProducts];
    newProducts[index][field] = value;
    setSelectedProducts(newProducts);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      products: selectedProducts.map(item => ({
        product: item.productId,
        quantity: Number(item.quantity)
      })),
      createdBy: 'staff-1' // In a real app, this would come from auth
    };
    createOrderMutation.mutate(orderData);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders?.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order._id.slice(-6)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => {
                        updateOrderStatusMutation.mutate({
                          orderId: order._id,
                          status: e.target.value
                        });
                      }}
                      className="ml-2 text-sm border rounded-md px-2 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.totalItems}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.createdBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">Create New Order</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {selectedProducts.map((item, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a product</option>
                        {products?.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} (Stock: {product.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        min="1"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(index)}
                        className="mt-6 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="text-blue-600 hover:text-blue-800"
                >
                  + Add Another Product
                </button>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={createOrderMutation.isLoading}
                >
                  {createOrderMutation.isLoading ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
