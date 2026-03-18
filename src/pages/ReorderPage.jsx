import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, RefreshCw, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Card, Button, Loader } from '../components/common/UIComponents';
import inventoryService from '../services/inventoryService';
import { toast } from 'react-toastify';

const ReorderPage = () => {
  const [reorders, setReorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    supplierName: '',
    suggestedQuantity: '',
    autoReorder: false,
    status: 'PENDING'
  });

  useEffect(() => {
    fetchReorders();
  }, []);

  const fetchReorders = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getReorders();
      setReorders(response.data);
    } catch (error) {
      toast.error('Failed to load reorders');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAuto = async (id, currentStatus) => {
    try {
      await inventoryService.updateReorder(id, { autoReorder: !currentStatus });
      toast.success('Auto Reorder updated');
      fetchReorders();
    } catch (error) {
      toast.error('Failed to toggle auto-reorder');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await inventoryService.updateReorderStatus(id, status);
      toast.success(`Status updated to ${status}`);
      fetchReorders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this reorder record?')) {
      try {
        await inventoryService.deleteReorder(id);
        toast.success('Reorder record deleted');
        fetchReorders();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.createReorder(formData);
      toast.success('Reorder created');
      setShowModal(false);
      setFormData({ productName: '', supplierName: '', suggestedQuantity: '', autoReorder: false, status: 'PENDING' });
      fetchReorders();
    } catch (error) {
      toast.error('Failed to create reorder');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'ORDERED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  if (loading && reorders.length === 0) return <div className="flex justify-center items-center h-64"><Loader /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">REORDER MANAGEMENT</h2>
          <p className="text-gray-500 text-xs mt-4 tracking-widest font-bold">STOCK REPLENISHMENT & SUPPLIER LOGISTICS</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 font-black tracking-widest uppercase"
        >
          <Plus size={18} /> New Reorder
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden border-2 border-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-black">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Product</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Supplier</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Qty</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Auto</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reorders.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg"><Package size={16} /></div>
                      <span className="font-bold text-sm">{r.productName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-tighter">
                      <Truck size={12} /> {r.supplierName}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-sm">{r.suggestedQuantity}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <select 
                        value={r.status}
                        onChange={(e) => handleUpdateStatus(r._id, e.target.value)}
                        className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border-2 outline-none transition-all ${getStatusStyle(r.status)}`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="ORDERED">Ordered</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => handleToggleAuto(r._id, r.autoReorder)}
                        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${r.autoReorder ? 'bg-black' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${r.autoReorder ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(r._id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reorders.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              <RefreshCw size={48} className="mx-auto mb-4 opacity-20 animate-spin-slow" />
              <p className="font-bold uppercase tracking-widest text-xs">No reorder records found</p>
            </div>
          )}
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md !p-8 border-2 border-black animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-tighter">Manual Reorder Request</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-black"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Product Name</label>
                <input
                  required
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-black transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Supplier Name</label>
                <input
                  required
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-black transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Quantity</label>
                  <input
                    required
                    type="number"
                    value={formData.suggestedQuantity}
                    onChange={(e) => setFormData({...formData, suggestedQuantity: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-black transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-black transition-all"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ORDERED">ORDERED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full !py-4 font-black tracking-widest uppercase shadow-premium mt-4">Initialize Reorder</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReorderPage;
