import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Layout } from 'lucide-react';
import { Card, Button, Input } from '../components/common/UIComponents';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

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
          <SettingsNavLink icon={User} label="General Account" active />
          <SettingsNavLink icon={Bell} label="Notifications" />
          <SettingsNavLink icon={Shield} label="Security & Privacy" />
          <SettingsNavLink icon={Layout} label="Dashboard Appearance" />
          <SettingsNavLink icon={Database} label="Data Management" />
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card title="Account Profile">
            <div className="flex items-center gap-8 mb-8 pb-8 border-b border-gray-100">
              <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center text-white text-3xl font-black">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="space-y-2">
                <Button variant="primary">CHANGE AVATAR</Button>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Max file size 2MB. JPG/PNG supported.</p>
              </div>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Display Name" value={user?.name || ''} readOnly />
              <Input label="Email Address" value={user?.email || ''} readOnly />
              <Input label="Position" value={user?.role || ''} readOnly />
              <Input label="Contact Number" placeholder="+1 (555) 000-0000" />
            </form>
            <div className="mt-8 flex justify-end">
              <Button>SAVE PROFILE UPDATES</Button>
            </div>
          </Card>

          <Card title="Business Details" subtitle="Configuration for billing and invoices">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Store Name" defaultValue="GROCERY MARKET" />
                <Input label="GST Number" defaultValue="22AAAAA0000A1Z5" />
              </div>
              <Input label="Store Address" defaultValue="123 Shopping Avenue, NY, USA" />
            </form>
            <div className="mt-8 flex justify-end">
              <Button>UPDATE STORE INFO</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SettingsNavLink = ({ icon: Icon, label, active = false }) => (
  <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-100 hover:text-black'}`}>
    <Icon size={18} />
    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default Settings;
