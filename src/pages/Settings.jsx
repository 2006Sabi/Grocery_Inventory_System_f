import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Layout } from 'lucide-react';
import { Card, Button, Input } from '../components/common/UIComponents';
import { useAuth } from '../context/AuthContext';

import api from '../services/api';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState('General Account');
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
    password: '',
  });
  const [storeData, setStoreData] = React.useState({
    name: user?.storeName || '',
    gstNumber: '',
    address: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [storeLoading, setStoreLoading] = React.useState(false);

  React.useEffect(() => {
    if (activeTab === 'General Account') {
      fetchUserProfile();
      if (user?.storeId) {
        fetchStoreDetails();
      }
    }
  }, [activeTab, user?.storeId]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        profileImage: data.profileImage || '',
        password: '',
      });
      // Optionally update user context if it differs
      if (data.name !== user.name || data.email !== user.email || data.phone !== user.phone || data.profileImage !== user.profileImage) {
        updateUser({ ...user, ...data });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStoreDetails = async () => {
    try {
      const { data } = await api.get(`/store/${user.storeId}`);
      setStoreData({
        name: data.name,
        gstNumber: data.gstNumber || '',
        address: data.address || '',
      });
    } catch (error) {
      console.error('Error fetching store details:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStoreChange = (e) => {
    setStoreData({ ...storeData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', formData);
      updateUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        profileImage: data.profileImage || '',
        password: '',
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    setStoreLoading(true);
    try {
      if (!user?.storeId) {
        throw new Error('Store ID not found. Please re-login.');
      }
      const { data } = await api.put(`/store/${user.storeId}`, storeData);
      setStoreData({
        name: data.name,
        gstNumber: data.gstNumber || '',
        address: data.address || '',
      });
      toast.success('Store details updated successfully!');
      // Update local store name if changed
      if (data.name !== user.storeName) {
        updateUser({ ...user, storeName: data.name });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating store details');
    } finally {
      setStoreLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase underline decoration-gray-200 underline-offset-8">SETTINGS</h2>
          <p className="text-gray-500 font-medium mt-3">Configure your workspace and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation */}
        <div className="space-y-2">
          <SettingsNavLink 
            icon={User} 
            label="General Account" 
            active={activeTab === 'General Account'} 
            onClick={() => setActiveTab('General Account')}
          />
          <SettingsNavLink 
            icon={Bell} 
            label="Notifications" 
            active={activeTab === 'Notifications'} 
            onClick={() => setActiveTab('Notifications')}
          />
          <SettingsNavLink 
            icon={Shield} 
            label="Security & Privacy" 
            active={activeTab === 'Security & Privacy'} 
            onClick={() => setActiveTab('Security & Privacy')}
          />
          <SettingsNavLink 
            icon={Layout} 
            label="Dashboard Appearance" 
            active={activeTab === 'Dashboard Appearance'} 
            onClick={() => setActiveTab('Dashboard Appearance')}
          />
          <SettingsNavLink 
            icon={Database} 
            label="Data Management" 
            active={activeTab === 'Data Management'} 
            onClick={() => setActiveTab('Data Management')}
          />
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'General Account' ? (
            <>
              <Card title="Account Profile">
                <div className="flex items-center gap-8 mb-8 pb-8 border-b border-gray-100">
                  <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center text-white text-3xl font-black overflow-hidden">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.[0] || 'A'
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input 
                      placeholder="Paste image URL..." 
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handleChange}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Provide a URL for your profile picture.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Display Name" 
                    name="name"
                    value={formData.name} 
                    onChange={handleChange}
                  />
                  <Input 
                    label="Email Address" 
                    name="email"
                    type="email"
                    value={formData.email} 
                    onChange={handleChange}
                  />
                  <Input label="Position" value={user?.role || ''} readOnly />
                  <Input 
                    label="Contact Number" 
                    name="phone"
                    placeholder="+1 (555) 000-0000" 
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <Input 
                    label="New Password" 
                    name="password"
                    type="password"
                    placeholder="Leave blank to keep current" 
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" loading={loading} variant="primary">
                      SAVE PROFILE UPDATES
                    </Button>
                  </div>
                </form>
              </Card>

              {user?.role === 'ADMIN' && (
                <Card title="Business Details" subtitle="Configuration for billing and invoices">
                  <form onSubmit={handleStoreSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input 
                        label="Store Name" 
                        name="name"
                        value={storeData.name} 
                        onChange={handleStoreChange}
                      />
                      <Input 
                        label="GST Number" 
                        name="gstNumber"
                        placeholder="Enter GSTIN" 
                        value={storeData.gstNumber}
                        onChange={handleStoreChange}
                      />
                    </div>
                    <Input 
                      label="Store Address" 
                      name="address"
                      placeholder="Enter full address" 
                      value={storeData.address}
                      onChange={handleStoreChange}
                    />
                    <div className="mt-8 flex justify-end">
                      <Button type="submit" loading={storeLoading} variant="secondary">
                        UPDATE STORE INFO
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
            </>
          ) : (
            <Card title={activeTab}>
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <SettingsIcon size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">{activeTab} Settings coming soon</h3>
                  <p className="text-sm text-gray-400 font-medium">We are working on bringing more configuration options to this section.</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsNavLink = ({ icon: Icon, label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-black text-white shadow-xl translate-x-1' : 'text-gray-400 hover:bg-gray-100 hover:text-black'}`}
  >
    <Icon size={18} />
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default Settings;
