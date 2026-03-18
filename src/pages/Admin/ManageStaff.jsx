import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, User, Trash2, Shield, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card, Button, Input, Modal } from '../../components/common/UIComponents';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CreateStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: []
  });

  const availablePermissions = [
    { id: 'view_products', label: 'View Products' },
    { id: 'edit_products', label: 'Edit Products' },
    { id: 'billing', label: 'Billing' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'reports', label: 'Reports' }
  ];

  const handlePermissionChange = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };
  const [submitting, setSubmitting] = useState(false);

  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin()) {
      fetchStaff();
    }
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/users/staff');
      setStaffList(response.data);
    } catch (error) {
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users/create-staff', formData);
      toast.success('Staff account created successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create staff');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="text-center p-12 max-w-md">
          <Shield size={64} className="mx-auto text-red-500 mb-6" />
          <h2 className="text-2xl font-black uppercase mb-4 tracking-tighter">ACCESS DENIED</h2>
          <p className="text-gray-500 font-medium leading-relaxed">Only Admin accounts can manage staff members. Please contact your administrator.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">STAFF MANAGEMENT</h2>
          <p className="text-gray-500 font-medium mt-3">Manage accounts for your store personnel</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-8">
          <UserPlus size={20} /> ADD STAFF MEMBER
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400 font-black uppercase tracking-widest animate-pulse">
            LOADING PERSONNEL...
          </div>
        ) : staffList.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-30">
            <User size={80} strokeWidth={1} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-[0.3em] text-sm">No staff added yet</p>
          </div>
        ) : (
          staffList.map((staff) => (
            <Card key={staff._id} className="group hover:border-black transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-lg group-hover:bg-black group-hover:text-white transition-colors">
                  {staff.name[0]}
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight text-lg">{staff.name}</h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{staff.email}</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] font-black bg-gray-50 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest border border-gray-100">
                  STAFF ROLE
                </span>
                <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="NEW STAFF MEMBER"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>CANCEL</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={20} /> : 'CREATE ACCOUNT'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input 
            label="Full Name"
            placeholder="John Doe"
            icon={<User size={18} />}
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            icon={<Mail size={18} />}
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <Input 
            label="Initial Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock size={18} />}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">ASSIGN PERMISSIONS</label>
            <div className="grid grid-cols-2 gap-2">
              {availablePermissions.map(perm => (
                <label key={perm.id} className="flex items-center gap-2 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-black"
                    checked={formData.permissions.includes(perm.id)}
                    onChange={() => handlePermissionChange(perm.id)}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-black">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed mt-4">
            Staff will use these credentials to access the system with limited permissions.
          </p>
        </form>
      </Modal>
    </div>
  );
};

export default CreateStaff;
