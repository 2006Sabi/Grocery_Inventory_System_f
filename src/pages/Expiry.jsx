import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Calendar, RefreshCw, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { Card, Button, Loader } from '../components/common/UIComponents';
import inventoryService from '../services/inventoryService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Expiry = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiryData();
  }, []);

  const fetchExpiryData = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getExpiryAlerts();
      setProducts(response.data.map((p, idx) => ({ ...p, id: p._id || idx })));
    } catch (error) {
      toast.error('Failed to load expiry data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'EXPIRED': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SAFE': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const columns = [
    { field: 'name', headerName: 'Product Name', flex: 1, renderCell: (params) => (
      <span className="font-bold uppercase tracking-tight">{params.value}</span>
    )},
    { field: 'expiryDate', headerName: 'Expiry Date', width: 200, renderCell: (params) => (
      <div className="flex items-center gap-2">
        <Calendar size={14} className="text-gray-400" />
        <span className="font-medium">{format(new Date(params.value), 'yyyy-MM-dd')}</span>
      </div>
    )},
    { field: 'priority', headerName: 'Priority Status', width: 200, renderCell: (params) => (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getPriorityColor(params.value)}`}>
        {params.value}
      </span>
    )},
    { field: 'stock', headerName: 'Current Stock', width: 150, renderCell: (params) => (
      <span className={`font-black ${params.value === 0 ? 'text-red-500' : 'text-black'}`}>{params.value}</span>
    )},
  ];

  const counts = products.reduce((acc, p) => {
    acc[p.priority] = (acc[p.priority] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">EXPIRY WATCH</h2>
          <p className="text-gray-500 text-xs mt-4 tracking-widest font-bold">REQUISITION & SHELF-LIFE MONITORING</p>
        </div>
        <Button variant="outline" onClick={fetchExpiryData} className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
          <RefreshCw size={14} /> RE-SCAN STORAGE
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Expired" value={counts.EXPIRED || 0} icon={<AlertTriangle className="text-red-500" />} color="border-red-500" />
        <StatCard label="High Risk" value={counts.HIGH || 0} icon={<Clock className="text-orange-500" />} color="border-orange-500" />
        <StatCard label="Medium" value={counts.MEDIUM || 0} icon={<Clock className="text-yellow-500" />} color="border-yellow-500" />
        <StatCard label="Safe" value={counts.SAFE || 0} icon={<ShieldCheck className="text-green-500" />} color="border-green-500" />
      </div>

      <Card className="!p-0 overflow-hidden shadow-premium !border-none">
        <div className="h-[500px] bg-white text-black">
          <DataGrid
            rows={products}
            columns={columns}
            pageSize={10}
            loading={loading}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f9f9f9', fontWeight: '800', textTransform: 'uppercase' },
              '& .MuiDataGrid-cell': { borderBottom: '1px solid #f5f5f5', fontSize: '13px' }
            }}
          />
        </div>
      </Card>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <Card className={`!p-4 border-t-4 ${color}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <h3 className="text-2xl font-black">{value}</h3>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    </div>
  </Card>
);

export default Expiry;
