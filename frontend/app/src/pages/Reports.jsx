import { useQuery } from '@tanstack/react-query';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = 'http://localhost:5000/api';

function Reports() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/products`);
      return data;
    }
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/orders`);
      return data;
    }
  });

  // Calculate statistics
  const stats = {
    totalProducts: products?.length || 0,
    lowStockProducts: products?.filter((p) => p.isLowStock).length || 0,
    totalOrders: orders?.length || 0,
    pendingOrders: orders?.filter((o) => o.status === 'Pending').length || 0
  };

  // Prepare data for stock levels chart
  const stockLevelsData = {
    labels: products?.map((p) => p.name) || [],
    datasets: [
      {
        label: 'Current Stock',
        data: products?.map((p) => p.quantity) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      },
      {
        label: 'Minimum Stock Level',
        data: products?.map((p) => p.minimumStockLevel) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  };

  // Prepare data for orders status chart
  const orderStatusData = {
    labels: ['Pending', 'Processed', 'Shipped'],
    datasets: [
      {
        label: 'Orders by Status',
        data: [
          orders?.filter((o) => o.status === 'Pending').length || 0,
          orders?.filter((o) => o.status === 'Processed').length || 0,
          orders?.filter((o) => o.status === 'Shipped').length || 0
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Download reports as CSV
  const downloadCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + data;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadProductsReport = () => {
    if (!products) return;
    const headers = ["Name,SKU,Quantity,Minimum Stock Level,Low Stock"];
    const rows = products.map(p => 
      `${p.name},${p.sku},${p.quantity},${p.minimumStockLevel},${p.isLowStock}`
    );
    downloadCSV([headers, ...rows].join("\n"), "products-report.csv");
  };

  const downloadOrdersReport = () => {
    if (!orders) return;
    const headers = ["Order ID,Status,Total Items,Created By,Date"];
    const rows = orders.map(o => 
      `${o._id},${o.status},${o.totalItems},${o.createdBy},${new Date(o.createdAt).toLocaleDateString()}`
    );
    downloadCSV([headers, ...rows].join("\n"), "orders-report.csv");
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Low Stock Items</h3>
          <p className="text-3xl font-bold text-red-600">{stats.lowStockProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Levels</h3>
          <Line data={stockLevelsData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
          <Bar data={orderStatusData} />
        </div>
      </div>

      {/* Download Reports */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Download Reports</h3>
        <div className="space-x-4">
          <button
            onClick={downloadProductsReport}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download Products Report
          </button>
          <button
            onClick={downloadOrdersReport}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Download Orders Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reports;
