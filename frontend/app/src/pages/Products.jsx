import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'https://app-oq9q.onrender.com/api';

function Products() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    quantity: '',
    minimumStockLevel: ''
  });

  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/products`);
      return data;
    }
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProduct) => {
      // Ensure quantity is not negative
      if (newProduct.quantity < 0) {
        throw new Error('Product quantity cannot be negative');
      }
      const { data } = await axios.post(`${API_URL}/products`, newProduct);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      setIsAddModalOpen(false);
      setNewProduct({ name: '', sku: '', quantity: '', minimumStockLevel: '' });
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      try {
        const { data } = await axios.delete(`${API_URL}/products/${productId}`);
        return data;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || 
          'Failed to delete product. Please try again.'
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
      console.error('Delete error:', error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const quantity = Number(newProduct.quantity);
    const minimumStockLevel = Number(newProduct.minimumStockLevel);

    if (quantity < 0) {
      alert('Product quantity cannot be negative');
      return;
    }

    if (minimumStockLevel < 0) {
      alert('Minimum stock level cannot be negative');
      return;
    }

    addProductMutation.mutate({
      ...newProduct,
      quantity,
      minimumStockLevel
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products?.map((product) => (
              <tr key={product._id} className={product.isLowStock ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.sku}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.minimumStockLevel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.quantity === 0 ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Out of Stock
                    </span>
                  ) : product.isLowStock ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      In Stock
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this product?')) {
                        try {
                          deleteProductMutation.mutate(product._id);
                        } catch (error) {
                          console.error('Delete error:', error);
                        }
                      }
                    }}
                    disabled={deleteProductMutation.isLoading}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteProductMutation.isLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Product</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <input
                    type="text"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: Math.max(0, e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    minLength="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    value={newProduct.minimumStockLevel}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, minimumStockLevel: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={addProductMutation.isLoading}
                >
                  {addProductMutation.isLoading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
