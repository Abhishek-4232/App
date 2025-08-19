import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notifications = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const fetchLowStockProducts = async () => {
    try {
      const response = await axios.get('https://app-oq9q.onrender.com/api/products');
      const products = response.data.filter(product => product.isLowStock);
      
      // Compare with previous low stock products to show new notifications
      products.forEach(product => {
        if (!lowStockProducts.find(p => p._id === product._id)) {
          toast.warning(
            `Low stock alert: ${product.name} (${product.quantity} remaining)`,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
        }
      });

      setLowStockProducts(products);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
    // Check for low stock products every 5 minutes
    const interval = setInterval(fetchLowStockProducts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return <ToastContainer />;
};

export default Notifications;
