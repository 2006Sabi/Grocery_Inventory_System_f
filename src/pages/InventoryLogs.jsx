import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Search, Filter, History, TrendingUp, TrendingDown, RefreshCw, Layers } from 'lucide-react';
import { Card, Button, Input, Loader } from '../components/common/UIComponents';
import inventoryService from '../services/inventoryService';
import { toast } from 'react-toastify';

const InventoryLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    action: ''
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: pageSize,
        search: filters.search,
        action: filters.action !== 'ALL' ? filters.action : ''
      };
      const response = await inventoryService.getLogs(params);
      const logData = Array.isArray(response.data) ? response.data : (response.data.logs || []);
      setLogs(logData.map(l => ({ ...l, id: l._id })));
      setTotal(response.data.total || logData.length);
    } catch (error) {
      toast.error('Failed to load inventory logs');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionStyle = (action) => {
    switch (action) {
      case 'ADD': return 'bg-green-50 text-green-600 border-green-100';
      case 'REMOVE': return 'bg-red-50 text-red-600 border-red-100';
      case 'SALE': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'UPDATE': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const columns = [
    { 
      field: 'createdAt', 
      headerName: 'Date', 
      width: 180,
      renderCell: (params) => (
        <span className="text-gray-500 font-bold text-xs uppercase">
          {new Date(params.value).toLocaleString()}
        </span>
      )
    },
    { field: 'productName', headerName: 'Product Name', flex: 1.5, renderCell: (params) => <span className="font-black text-sm uppercase tracking-tighter">{params.value}</span> },
    { 
      field: 'action', 
      headerName: 'Action', 
      width: 120,
      renderCell: (params) => (
        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${getActionStyle(params.value)}`}>
          {params.value}
        </span>
      )
    },
    { 
      field: 'quantity', 
      headerName: 'Qty', 
      width: 100,
      renderCell: (params) => (
        <span className={`font-black ${params.row.action === 'ADD' ? 'text-green-600' : 'text-red-600'}`}>
          {params.row.action === 'ADD' ? `+${params.value}` : `-${params.value}`}
        </span>
      )
    },
    { field: 'previousStock', headerName: 'Prev', width: 90, renderCell: (params) => <span className="text-gray-400 font-bold">{params.value}</span> },
    { field: 'newStock', headerName: 'Current', width: 90, renderCell: (params) => <span className="text-black font-black">{params.value}</span> },
    { 
      field: 'performedBy', 
      headerName: 'Performed By', 
      width: 150,
      renderCell: (params) => <span className="text-xs font-bold text-gray-500 italic">{params.value?.name || 'System'}</span>
    },
    { field: 'note', headerName: 'Note', flex: 1, renderCell: (params) => <span className="text-xs text-gray-500 font-medium italic truncate">{params.value}</span> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">INVENTORY HISTORY</h2>
          <p className="text-gray-500 font-medium mt-3 tracking-widest text-[10px] uppercase font-black opacity-50">Audit logs & Stock Movement Tracking</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="p-3 bg-black text-white rounded-2xl shadow-premium">
                <History size={24} />
            </div>
        </div>
      </div>

      <Card className="!p-0 overflow-hidden shadow-premium !border-none">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 bg-white">
          <div className="flex-1 min-w-[300px] flex items-center bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl focus-within:border-black focus-within:bg-white transition-all">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by product name..." 
              className="bg-transparent border-none outline-none ml-2 text-sm w-full font-bold"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select 
            className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:border-black transition-all"
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          >
            <option value="ALL">All Actions</option>
            <option value="ADD">Stock Added</option>
            <option value="REMOVE">Stock Removed</option>
            <option value="SALE">Sales (Billing)</option>
            <option value="UPDATE">Manual Updates</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>
          <Button variant="outline" onClick={() => { setPage(0); fetchLogs(); }} className="flex items-center gap-2 !py-2">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> REFRESH
          </Button>
        </div>

        <div className="h-[650px] bg-white">
          <DataGrid
            rows={logs}
            columns={columns}
            paginationMode="server"
            rowCount={total}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={(model) => {
              setPage(model.page);
              setPageSize(model.pageSize);
            }}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeader': { 
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                fontSize: '11px',
                fontWeight: '900', 
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              },
              '& .MuiDataGrid-cell': { 
                borderBottom: '1px solid #f1f5f9',
                fontSize: '13px',
                '&:focus': { outline: 'none' }
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f8fafc'
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none'
              }
            }}
          />
        </div>
      </Card>
      
      {logs.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Layers size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No inventory logs found</p>
        </div>
      )}
    </div>
  );
};

export default InventoryLogs;
