import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { AlertCircle, ArrowUpRight, ShoppingCart, RefreshCcw } from 'lucide-react';
import { Card, Button, Loader } from '../components/common/UIComponents';
import productService from '../services/productService';
import inventoryService from '../services/inventoryService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LowStock = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll();
      const filtered = response.data.products
        .filter(p => p.stock <= p.threshold)
        .map(p => ({ ...p, id: p._id }));
      setProducts(filtered);
    } catch (error) {
      toast.error('Failed to load low stock items');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReorder = async (product) => {
    try {
      await inventoryService.createReorder({
        productId: product._id,
        productName: product.name,
        supplierId: product.supplierId?._id,
        supplierName: product.supplierId?.name || 'Unknown Supplier',
        suggestedQuantity: product.threshold * 2,
        status: 'PENDING'
      });
      toast.success(`Reorder initiated for ${product.name}`);
      navigate('/reorders');
    } catch (error) {
      toast.error('Failed to initiate reorder');
    }
  };

  const getStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'EXPIRED', color: 'bg-black' };
    if (diffDays < 7) return { label: 'CRITICAL', color: 'bg-red-500' };
    if (diffDays < 30) return { label: 'WARNING', color: 'bg-orange-500' };
    return { label: 'SAFE', color: 'bg-green-500' };
  };

  const columns = [
    { field: 'name', headerName: 'Product', flex: 1 },
    { 
      field: 'stock', 
      headerName: 'In Stock', 
      width: 120,
      renderCell: (params) => (
        <span className="font-black text-red-600">{params.value}</span>
      )
    },
    { 
      field: 'threshold', 
      headerName: 'Threshold', 
      width: 120,
      renderCell: (params) => (
        <span className="font-bold text-gray-400">{params.value}</span>
      )
    },
    { 
      field: 'categoryId', 
      headerName: 'Category', 
      width: 150,
      renderCell: (params) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {params.row.categoryId?.name || 'N/A'}
        </span>
      )
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 180,
      renderCell: (params) => (
        <Button 
          onClick={() => handleReorder(params.row)}
          className="!py-1.5 !px-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black hover:text-white transition-all"
        >
          <RefreshCcw size={12} /> REORDER
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex gap-4 items-center">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl shadow-soft">
            <AlertCircle size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">LOW STOCK</h2>
            <p className="text-gray-500 font-medium mt-3">Critical items requiring immediate attention</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right border-r border-gray-100 pr-6">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Expired</p>
            <p className="text-2xl font-black">{products.filter(p => new Date(p.expiryDate) < new Date()).length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tracking</p>
            <p className="text-2xl font-black">{products.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ExpiryStat color="bg-black" label="Expired" count={products.filter(p => getStatus(p.expiryDate).label === 'EXPIRED').length} />
        <ExpiryStat color="bg-red-500" label="Critical" count={products.filter(p => getStatus(p.expiryDate).label === 'CRITICAL').length} />
        <ExpiryStat color="bg-orange-500" label="Warning" count={products.filter(p => getStatus(p.expiryDate).label === 'WARNING').length} />
        <ExpiryStat color="bg-green-500" label="Safe" count={products.filter(p => getStatus(p.expiryDate).label === 'SAFE').length} />
      </div>

      <Card className="!p-0 overflow-hidden shadow-premium !border-none">
        <div className="h-[500px] bg-white">
          <DataGrid
            rows={products}
            columns={columns}
            pageSize={10}
            loading={loading}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f9f9f9', fontWeight: '800', textTransform: 'uppercase' },
              '& .MuiDataGrid-cell': { borderBottom: '1px solid #f5f5f5', fontSize: '14px', fontWeight: '500' }
            }}
          />
        </div>
      </Card>
    </div>
  );
};

const ExpiryStat = ({ color, label, count }) => (
  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-soft">
    <div className={`w-3 h-3 ${color} rounded-full mb-2`}></div>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    <p className="text-xl font-black">{count}</p>
  </div>
);

const AlertHighlightCard = ({ title, count, color }) => (
  <div className={`p-6 rounded-2xl border border-gray-100 shadow-soft flex justify-between items-center ${color}`}>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{title}</p>
      <h3 className="text-3xl font-black tracking-tight">{count}</h3>
    </div>
    <div className="p-2 bg-gray-50/10 rounded-lg">
      <ArrowUpRight size={20} />
    </div>
  </div>
);

export default LowStock;
