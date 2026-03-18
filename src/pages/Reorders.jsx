import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { RefreshCw, Truck, CheckCircle, PackageSearch, Plus, Filter, Loader as LoaderIcon } from 'lucide-react';
import { Card, Button, Loader } from '../components/common/UIComponents';
import inventoryService from '../services/inventoryService';
import { toast } from 'react-toastify';

const Reorders = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [reorders, setReorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'suggestions'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sugRes, reoRes] = await Promise.all([
        inventoryService.getReorderSuggestions(),
        inventoryService.getReorders()
      ]);
      setSuggestions(sugRes.data.map((s, idx) => ({ ...s, id: `s-${idx}` })));
      setReorders(reoRes.data.map((r, idx) => ({ ...r, id: r._id || idx })));
    } catch (error) {
      toast.error('Failed to load reorder data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReorder = async (productId) => {
    try {
      await inventoryService.createReorder(productId);
      toast.success('Reorder created successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to create reorder');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await inventoryService.updateReorderStatus(id, { status });
      toast.success(`Status updated to ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const suggestionColumns = [
    { field: 'name', headerName: 'Product', flex: 1, renderCell: (params) => <span className="font-bold uppercase tracking-tight">{params.value}</span> },
    { 
      field: 'stock', 
      headerName: 'Stock', 
      width: 100,
      renderCell: (params) => <span className="font-bold text-red-500">{params.value}</span>
    },
    { field: 'threshold', headerName: 'Threshold', width: 100 },
    { field: 'supplierId', headerName: 'Supplier', width: 150, renderCell: (params) => params.value?.name || 'N/A' },
    { 
      field: 'actions', 
      headerName: 'Action', 
      width: 180,
      renderCell: (params) => (
        <Button 
          onClick={() => handleCreateReorder(params.row._id)}
          className="!py-1.5 !px-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
        >
          <Plus size={12} /> CREATE ORDER
        </Button>
      )
    }
  ];

  const reorderColumns = [
    { field: 'productId', headerName: 'Product', flex: 1, renderCell: (params) => <span className="font-bold uppercase tracking-tight">{params.value?.name || 'Unknown'}</span> },
    { field: 'suggestedQuantity', headerName: 'Qty', width: 100, renderCell: (params) => <span className="font-black">{params.value}</span> },
    { field: 'supplierId', headerName: 'Supplier', width: 150, renderCell: (params) => params.value?.name || 'N/A' },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
          params.value === 'PENDING' ? 'bg-orange-100 text-orange-800' :
          params.value === 'ORDERED' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {params.value}
        </span>
      )
    },
    { 
      field: 'actions', 
      headerName: 'Transitions', 
      width: 250,
      renderCell: (params) => (
        <div className="flex gap-2">
          {params.value === 'PENDING' && (
            <Button 
              variant="outline"
              onClick={() => handleUpdateStatus(params.row._id, 'ORDERED')}
              className="!py-1 !px-3 !text-[10px] font-black uppercase tracking-widest"
            >
              <Truck size={12} className="mr-1" /> Mark Ordered
            </Button>
          )}
          {params.value === 'ORDERED' && (
            <Button 
              onClick={() => handleUpdateStatus(params.row._id, 'COMPLETED')}
              className="!py-1 !px-3 !text-[10px] font-black uppercase tracking-widest"
            >
              <CheckCircle size={12} className="mr-1" /> Complete
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">REORDER MANAGEMENT</h2>
          <p className="text-gray-500 text-xs mt-4 tracking-widest font-bold">SUPPLY CHAIN & LOGISTICS PIPELINE</p>
        </div>
        <div className="flex gap-2">
           <Button 
            variant={activeTab === 'active' ? 'default' : 'outline'}
            onClick={() => setActiveTab('active')}
            className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
          >
            ACTIVE REORDERS ({reorders.length})
          </Button>
          <Button 
            variant={activeTab === 'suggestions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('suggestions')}
            className="flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
          >
            SUGGESTIONS ({suggestions.length})
          </Button>
          <Button variant="outline" onClick={fetchData} className="flex items-center gap-2">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden shadow-premium !border-none">
        <div className="h-[550px] bg-white text-black">
          <DataGrid
            rows={activeTab === 'active' ? reorders : suggestions}
            columns={activeTab === 'active' ? reorderColumns : suggestionColumns}
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

export default Reorders;
