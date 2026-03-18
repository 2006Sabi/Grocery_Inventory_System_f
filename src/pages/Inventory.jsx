import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { History, TrendingUp, TrendingDown, RefreshCw, Filter, Search } from 'lucide-react';
import { Card, Button, Input, Modal, Loader } from '../components/common/UIComponents';
import inventoryService from '../services/inventoryService';
import productService from '../services/productService';
import { toast } from 'react-toastify';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('levels'); // 'levels' or 'logs'
  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateModal, setUpdateModal] = useState({ open: false, product: null, quantity: '' });

  useEffect(() => {
    if (activeTab === 'levels') fetchInventory();
    else fetchLogs();
  }, [activeTab]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await productService.getAll();
      setInventory(response.data.products.map(p => ({ ...p, id: p._id })));
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getLogs();
      setLogs(response.data.map(l => ({ ...l, id: l._id })));
    } catch (error) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!updateModal.quantity) return;
    try {
      await inventoryService.updateStock(updateModal.product._id, { 
        quantity: parseInt(updateModal.quantity),
        type: 'Adjustment',
        reason: 'Manual Inventory Adjustment'
      });
      toast.success('Stock updated successfully');
      setUpdateModal({ open: false, product: null, quantity: '' });
      fetchInventory();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const levelColumns = [
    { field: 'name', headerName: 'Product', flex: 1 },
    { 
      field: 'categoryId', 
      headerName: 'Category', 
      width: 150,
      renderCell: (params) => (
        <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
          {params.row.categoryId?.name || 'N/A'}
        </span>
      )
    },
    { 
      field: 'stock', 
      headerName: 'Current Stock', 
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <span className={`font-black ${params.value <= params.row.threshold ? 'text-red-500' : 'text-black'}`}>{params.value}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PCS</span>
        </div>
      )
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 150,
      renderCell: (params) => (
        <Button variant="ghost" className="!p-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black hover:text-white" onClick={() => setUpdateModal({ open: true, product: params.row, quantity: '' })}>
          <RefreshCw size={14} /> Update
        </Button>
      )
    }
  ];

  const logColumns = [
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 180,
      valueFormatter: (value) => new Date(value).toLocaleString()
    },
    { field: 'productName', headerName: 'Product', flex: 1 },
    { 
      field: 'changeType', 
      headerName: 'Type', 
      width: 120,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${params.value === 'Sale' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {params.value}
        </span>
      )
    },
    { 
      field: 'quantity', 
      headerName: 'Change', 
      width: 120,
      renderCell: (params) => (
        <span className={`font-bold ${params.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {params.value > 0 ? `+${params.value}` : params.value}
        </span>
      )
    },
    { field: 'reason', headerName: 'Reason', flex: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">INVENTORY</h2>
          <p className="text-gray-500 font-medium mt-3">Track stock levels and movement logs</p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-soft">
          <button 
            onClick={() => setActiveTab('levels')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'levels' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400'}`}
          >
            STOCK LEVELS
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'logs' ? 'bg-white text-black shadow-lg scale-105' : 'text-gray-400'}`}
          >
            MOVEMENT LOGS
          </button>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden shadow-premium !border-none">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-white">
          <div className="flex-1 flex items-center bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl focus-within:border-black focus-within:bg-white transition-all">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Filter by product name, SKU..." className="bg-transparent border-none outline-none ml-2 text-sm w-full" />
          </div>
          <Button variant="outline" className="flex items-center gap-2 !py-2">
            <Filter size={18} /> FILTER
          </Button>
        </div>

        <div className="h-[600px] bg-white">
          <DataGrid
            rows={activeTab === 'levels' ? inventory : logs}
            columns={activeTab === 'levels' ? levelColumns : logColumns}
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

      <Modal
        isOpen={updateModal.open}
        onClose={() => setUpdateModal({ open: false, product: null, quantity: '' })}
        title="UPDATE STOCK"
        footer={
          <>
            <Button variant="outline" onClick={() => setUpdateModal({ open: false, product: null, quantity: '' })}>CANCEL</Button>
            <Button onClick={handleUpdateStock}>CONFIRM UPDATE</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Product Selected</p>
            <p className="text-lg font-black tracking-tight">{updateModal.product?.name}</p>
            <p className="text-sm font-bold text-gray-500 mt-1">Current Stock: <span className="text-black">{updateModal.product?.stock}</span></p>
          </div>
          <Input 
            label="Adjustment Quantity" 
            placeholder="e.g. +50 or -10" 
            type="number"
            value={updateModal.quantity}
            onChange={(e) => setUpdateModal({ ...updateModal, quantity: e.target.value })}
            autoFocus
          />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider italic">
            * positive values increase stock, negative values decrease stock.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
