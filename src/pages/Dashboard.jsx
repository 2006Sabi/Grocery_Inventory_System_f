import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Bell
} from 'lucide-react';
import { Card } from '../components/common/UIComponents';
import api from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    lowStock: 0,
    expired: 0,
    todaySales: 0,
    monthlySales: 0,
    salesData: [],
    inventoryData: [],
    notificationCount: 0
  });
  const [manualReorderProducts, setManualReorderProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, manualRes, notifRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/products/manual-reorder'),
        api.get('/notifications')
      ]);
      setDashboardData({
        ...statsRes.data,
        notificationCount: Array.isArray(notifRes.data) ? notifRes.data.filter(n => !n.isRead).length : 0
      });
      setManualReorderProducts(manualRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const COLORS = ['#000000', '#333333', '#666666', '#999999'];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">DASHBOARD</h2>
          <p className="text-gray-500 font-medium mt-1">Real-time overview of your grocery inventory</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-soft">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value={dashboardData.totalProducts} 
          icon={<Package className="text-white" size={24} />}
          trend="+0%"
          theme="black"
        />
        <StatCard 
          title="Today's Sales" 
          value={`$${dashboardData.todaySales.toFixed(2)}`} 
          icon={<ShoppingCart className="text-black" size={24} />}
          trend="+0%"
          theme="white"
        />
        <StatCard 
          title="Low Stock" 
          value={dashboardData.lowStock} 
          icon={<AlertTriangle className="text-black" size={24} />}
          trend="0"
          theme="white"
          alert={dashboardData.lowStock > 0}
        />
        <StatCard 
          title="Monthly Sales" 
          value={`$${dashboardData.monthlySales.toFixed(2)}`} 
          icon={<TrendingUp className="text-black" size={24} />}
          trend="+0%"
          theme="white"
        />
        <StatCard 
          title="Notifications" 
          value={dashboardData.notificationCount} 
          icon={<Bell className="text-white" size={24} />}
          trend="New"
          theme="black"
          onClick={() => window.location.href='/notifications'}
        />
      </div>

      {/* Manual Attention Required */}
      {manualReorderProducts.length > 0 && (
        <Card className="!bg-red-50 !border-red-100 mb-8 border-l-8 !border-l-red-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500 text-white rounded-xl shadow-lg animate-pulse">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-red-950 uppercase tracking-tight">Manual Attention Required</h3>
                <p className="text-red-700 font-bold text-xs uppercase tracking-widest mt-0.5">
                  {manualReorderProducts.length} items below threshold with Auto-Reorder OFF
                </p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href='/reorders'}
              className="px-6 py-2.5 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg"
            >
              TAKE ACTION NOW
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {manualReorderProducts.slice(0, 4).map(product => (
              <div key={product._id} className="bg-white p-4 rounded-xl border border-red-100 flex justify-between items-center group hover:border-black transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center font-black group-hover:bg-black group-hover:text-white transition-all">{product.name[0]}</div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight">{product.name}</p>
                    <p className="text-[10px] font-bold text-red-500 uppercase">Stock: {product.stock} (Min: {product.minStock})</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts Section */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card title="Sales Analytics" subtitle="Weekly performance" className="lg:col-span-2 min-h-[400px]">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#999', fontSize: 12, fontWeight: 'bold' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#999', fontSize: 12, fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', borderColor: '#f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#000" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#000' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#000' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Inventory Distribution */}
        <Card title="Inventory" subtitle="By Category" className="min-h-[400px]">
          <div className="h-80 w-full mt-4 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.inventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData.inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              {dashboardData.inventoryData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, theme = 'white', alert = false }) => (
  <Card className={`relative overflow-hidden transition-transform hover:scale-[1.02] ${theme === 'black' ? 'bg-black text-white !border-black' : 'bg-white'}`}>
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${theme === 'black' ? 'bg-gray-800' : 'bg-gray-50 border border-gray-100'}`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'} bg-gray-50 px-2 py-1 rounded-lg border border-gray-100`}>
        {trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    <div className="mt-6">
      <p className={`text-sm font-bold uppercase tracking-widest ${theme === 'black' ? 'text-gray-400' : 'text-gray-400'}`}>{title}</p>
      <h3 className="text-3xl font-black mt-1 tracking-tight">{value}</h3>
    </div>
    {alert && <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 rotate-45 translate-x-10 -translate-y-10"></div>}
  </Card>
);

export default Dashboard;
