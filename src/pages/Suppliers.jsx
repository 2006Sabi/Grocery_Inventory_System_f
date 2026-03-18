import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, Search } from 'lucide-react';
import { Card, Button, Input, Modal } from '../components/common/UIComponents';
import supplierService from '../services/supplierService';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });

  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await supplierService.getAll();
      setSuppliers(response.data.map(s => ({ ...s, id: s._id })));
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address
      });
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier._id, formData);
        toast.success('Supplier updated');
      } else {
        await supplierService.create(formData);
        toast.success('Supplier added');
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this supplier?')) {
      try {
        await supplierService.delete(id);
        toast.success('Supplier deleted');
        fetchSuppliers();
      } catch (error) {
        toast.error('Deletion failed');
      }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Supplier Name', flex: 1, minWidth: 200 },
    { field: 'contactPerson', headerName: 'Contact Person', width: 180 },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center gap-2 text-gray-400">
          <Mail size={14} /> <span>{params.value}</span>
        </div>
      )
    },
    { 
      field: 'phone', 
      headerName: 'Phone', 
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center gap-2 text-gray-400">
          <Phone size={14} /> <span>{params.value}</span>
        </div>
      )
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 120,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpenModal(params.row)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Edit2 size={16} /></button>
          {isAdmin() && (
            <button onClick={() => handleDelete(params.row._id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">SUPPLIERS</h2>
          <p className="text-gray-500 font-medium mt-3">Manage product procurement sources</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-8">
          <Plus size={20} /> ADD SUPPLIER
        </Button>
      </div>

      <Card className="!p-0 overflow-hidden shadow-premium !border-none">
        <div className="h-[600px] bg-white text-black">
          <DataGrid
            rows={suppliers}
            columns={columns}
            pageSize={10}
            loading={loading}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f9f9f9', fontWeight: '800', textTransform: 'uppercase' },
              '& .MuiDataGrid-cell': { borderBottom: '1px solid #f5f5f5', fontSize: '14px' }
            }}
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'EDIT SUPPLIER' : 'NEW SUPPLIER'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>CANCEL</Button>
            <Button onClick={handleSubmit}>{editingSupplier ? 'UPDATE' : 'SAVE'}</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Supplier Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <Input label="Contact Person" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
          </div>
          <Input label="Address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
